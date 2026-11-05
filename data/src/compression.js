/**
 * Handles compression and decompression of various archive formats (ZIP, 7Z, RAR)
 * for the EmulatorJS system.
 *
 * This class provides functionality to detect compressed file formats and extract
 * their contents using web workers for better performance.
 */
class EJS_COMPRESSION {
    /**
     * Creates a new compression handler instance.
     *
     * @param {Object} EJS - The main EmulatorJS instance
     */
    constructor(EJS) {
        this.EJS = EJS;
    }

    /**
     * Detects if the given data represents a compressed archive format.
     *
     * @param {Uint8Array|ArrayBuffer} data - The binary data to analyze
     * @returns {string|null} The detected compression format ('zip', '7z', 'rar') or null if not compressed
     *
     * @description
     * Checks the file signature (magic bytes) at the beginning of the data to identify
     * the compression format. Supports ZIP, 7Z, and RAR formats.
     *
     * @see {@link https://www.garykessler.net/library/file_sigs.html|File Signature Database}
     */
    isCompressed(data) {
            if ((data[0] === 0x50 && data[1] === 0x4B) && ((data[2] === 0x03 && data[3] === 0x04) || (data[2] === 0x05 && data[3] === 0x06) || (data[2] === 0x07 && data[3] === 0x08))) {
                return "zip";
            } else if (data[0] === 0x37 && data[1] === 0x7A && data[2] === 0xBC && data[3] === 0xAF && data[4] === 0x27 && data[5] === 0x1C) {
                return "7z";
            } else if ((data[0] === 0x52 && data[1] === 0x61 && data[2] === 0x72 && data[3] === 0x21 && data[4] === 0x1A && data[5] === 0x07) && ((data[6] === 0x00) || (data[6] === 0x01 && data[7] === 0x00))) {
                return "rar";
            }
            return null;
        }

    /**
     * Decompresses the given data and extracts all files.
     *
     * @param {Uint8Array|ArrayBuffer} data - The compressed data to extract
     * @param {Function} updateMsg - Callback function for progress updates (message, isProgress)
     * @param {Function} fileCbFunc - Callback function called for each extracted file (filename, fileData)
     * @returns {Promise<Object>} Promise that resolves to an object mapping filenames to file data
     *
     * @description
     * Automatically detects the compression format and delegates to the appropriate
     * decompression method. If the data is not compressed, returns it as-is.
     */
    decompress(data, updateMsg, fileCbFunc) {
        const compressed = this.isCompressed(data.slice(0, 10));
        if (compressed === null) {
            if (typeof fileCbFunc === "function") {
                fileCbFunc("!!notCompressedData", data);
            }
            return new Promise(resolve => resolve({ "!!notCompressedData": data }));
        }
        if (compressed === "zip") {
            return this.extractZipNative(data, updateMsg, fileCbFunc).catch((e) => {
                console.warn("Native zip extraction failed, using the zip worker:", e);
                return this.decompressFile(compressed, data, updateMsg, fileCbFunc);
            });
        }
        return this.decompressFile(compressed, data, updateMsg, fileCbFunc);
    }

    /**
     * Reads a zip's central directory and returns its file entries.
     *
     * @param {Uint8Array} data - The zip archive
     * @returns {Array<Object>} Entries with name, method, compressed and uncompressed sizes and data offset
     * @throws {Error} When the archive is malformed, encrypted or uses an unsupported method
     */
    readZipEntries(data) {
        const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
        const u64 = (offset) => view.getUint32(offset, true) + view.getUint32(offset + 4, true) * 0x100000000;

        // The end of central directory record sits within the last 64 KiB plus its own 22 bytes
        let eocd = -1;
        for (let i = data.length - 22; i >= Math.max(0, data.length - 65557); i--) {
            if (view.getUint32(i, true) === 0x06054b50) {
                eocd = i;
                break;
            }
        }
        if (eocd < 0) throw new Error("No end of central directory record");

        let count = view.getUint16(eocd + 10, true);
        let cdOffset = view.getUint32(eocd + 16, true);
        if (count === 0xFFFF || cdOffset === 0xFFFFFFFF) {
            const locator = eocd - 20;
            if (locator < 0 || view.getUint32(locator, true) !== 0x07064b50) throw new Error("Missing zip64 locator");
            const zip64Eocd = u64(locator + 8);
            if (view.getUint32(zip64Eocd, true) !== 0x06064b50) throw new Error("Missing zip64 end record");
            count = u64(zip64Eocd + 32);
            cdOffset = u64(zip64Eocd + 48);
        }

        const decoder = new TextDecoder();
        const entries = [];
        let p = cdOffset;
        for (let i = 0; i < count; i++) {
            if (view.getUint32(p, true) !== 0x02014b50) throw new Error("Bad central directory entry");
            const flags = view.getUint16(p + 8, true);
            const method = view.getUint16(p + 10, true);
            let compressedSize = view.getUint32(p + 20, true);
            let size = view.getUint32(p + 24, true);
            const nameLength = view.getUint16(p + 28, true);
            const extraLength = view.getUint16(p + 30, true);
            const commentLength = view.getUint16(p + 32, true);
            let localOffset = view.getUint32(p + 42, true);
            const name = decoder.decode(data.subarray(p + 46, p + 46 + nameLength));

            // Sizes and offsets that don't fit in 32 bits are in the zip64 extra field, in this order
            let extra = p + 46 + nameLength;
            const extraEnd = extra + extraLength;
            while (extra + 4 <= extraEnd) {
                const id = view.getUint16(extra, true);
                const length = view.getUint16(extra + 2, true);
                if (id === 0x0001) {
                    let field = extra + 4;
                    if (size === 0xFFFFFFFF) { size = u64(field); field += 8; }
                    if (compressedSize === 0xFFFFFFFF) { compressedSize = u64(field); field += 8; }
                    if (localOffset === 0xFFFFFFFF) { localOffset = u64(field); }
                }
                extra += 4 + length;
            }
            p = extraEnd + commentLength;

            if (name.endsWith("/")) continue;
            if (flags & 1) throw new Error("Encrypted entry: " + name);
            if (method !== 0 && method !== 8) throw new Error("Unsupported method " + method + ": " + name);
            if (view.getUint32(localOffset, true) !== 0x04034b50) throw new Error("Bad local header: " + name);
            const start = localOffset + 30 + view.getUint16(localOffset + 26, true) + view.getUint16(localOffset + 28, true);
            if (start + compressedSize > data.length) throw new Error("Entry runs past the end: " + name);
            entries.push({ name, method, compressedSize, size, start });
        }
        return entries;
    }

    /**
     * Extracts a zip with the browser's DecompressionStream, writing each file into one buffer of its final size.
     *
     * @param {Uint8Array} data - The zip archive
     * @param {Function} updateMsg - Callback function for progress updates (message, isProgress)
     * @param {Function} fileCbFunc - Callback function called for each extracted file (filename, fileData)
     * @returns {Promise<Object>} Promise that resolves to an object mapping filenames to file data
     */
    async extractZipNative(data, updateMsg, fileCbFunc) {
        if (typeof DecompressionStream !== "function") throw new Error("DecompressionStream is unavailable");
        if (!(data instanceof Uint8Array)) data = new Uint8Array(data);
        const entries = this.readZipEntries(data);
        const total = entries.reduce((sum, entry) => sum + entry.compressedSize, 0) || 1;
        let done = 0;
        let lastPercent = -1;
        const progress = (bytes) => {
            const percent = Math.floor((done + bytes) / total * 100);
            if (percent !== lastPercent) {
                lastPercent = percent;
                updateMsg(" " + percent + "%", true);
            }
        };

        const extracted = [];
        for (const entry of entries) {
            const end = entry.start + entry.compressedSize;
            let out;
            if (entry.method === 0) {
                if (entry.compressedSize !== entry.size) throw new Error("Stored size mismatch: " + entry.name);
                out = data.subarray(entry.start, end);
            } else {
                out = new Uint8Array(entry.size);
                const chunkSize = 1024 * 1024;
                let readPos = entry.start;
                const source = new ReadableStream({
                    pull(controller) {
                        if (readPos >= end) {
                            controller.close();
                            return;
                        }
                        const next = Math.min(readPos + chunkSize, end);
                        controller.enqueue(data.slice(readPos, next));
                        readPos = next;
                        progress(readPos - entry.start);
                    }
                });
                const reader = source.pipeThrough(new DecompressionStream("deflate-raw")).getReader();
                let written = 0;
                while (true) {
                    const { done: finished, value } = await reader.read();
                    if (finished) break;
                    if (written + value.length > out.length) throw new Error("Entry is larger than its header says: " + entry.name);
                    out.set(value, written);
                    written += value.length;
                }
                if (written !== out.length) throw new Error("Entry is smaller than its header says: " + entry.name);
            }
            done += entry.compressedSize;
            progress(0);
            extracted.push([entry.name, out]);
        }

        const files = {};
        for (const [name, out] of extracted) {
            if (typeof fileCbFunc === "function") {
                fileCbFunc(name, out);
                files[name] = true;
            } else {
                files[name] = out;
            }
        }
        return files;
    }

    /**
     * Retrieves the appropriate worker script for the specified compression method.
     *
     * @param {string} method - The compression method ('7z', 'zip', or 'rar')
     * @returns {Promise<Blob>} Promise that resolves to a Blob containing the worker script
     *
     * @description
     * Downloads the necessary worker script and WASM files for the specified compression
     * method. For RAR files, also downloads the libunrar.wasm file and creates a custom
     * worker script with the WASM binary embedded.
     *
     * @throws {Error} When network errors occur during file downloads
     */
    getWorkerFile(method) {
        return new Promise(async (resolve, reject) => {
            let path, obj;
            if (method === "7z") {
                path = "compression/extract7z.js";
                obj = "sevenZip";
            } else if (method === "zip") {
                path = "compression/extractzip.js";
                obj = "zip";
            } else if (method === "rar") {
                path = "compression/libunrar.js";
                obj = "rar";
            }
            const res = await this.EJS.downloadFile(path, this.EJS.downloadType.support.name, null, false, { responseType: "text", method: "GET" }, false, this.EJS.downloadType.support.dontCache);
            if (res === -1) {
                this.EJS.startGameError("Network Error");
                return;
            }
            if (method === "rar") {
                const res2 = await this.EJS.downloadFile("compression/libunrar.wasm", this.EJS.downloadType.support.name, null, false, { responseType: "arraybuffer", method: "GET" }, false, this.EJS.downloadType.support.dontCache);
                if (res2 === -1) {
                    this.EJS.startGameError("Network Error");
                    return;
                }
                const path = URL.createObjectURL(new Blob([res2.data], { type: "application/wasm" }));
                const script = `
                    let dataToPass = [];
                    Module = {
                        monitorRunDependencies: function(left) {
                            if (left == 0) {
                                setTimeout(function() {
                                    unrar(dataToPass, null);
                                }, 100);
                            }
                        },
                        onRuntimeInitialized: function() {},
                        locateFile: function(file) {
                            console.log("locateFile");
                            return "` + path + `";
                        }
                    };
                    ` + res.data + `
                    let unrar = function(data, password) {
                        let cb = function(fileName, fileSize, progress) {
                            postMessage({ "t": 4, "current": progress, "total": fileSize, "name": fileName });
                        };
                        let rarContent = readRARContent(data.map(function(d) {
                            return {
                                name: d.name,
                                content: new Uint8Array(d.content)
                            }
                        }), password, cb)
                        let rec = function(entry) {
                            if (!entry) return;
                            if (entry.type === "file") {
                                postMessage({ "t": 2, "file": entry.fullFileName, "size": entry.fileSize, "data": entry.fileContent });
                            } else if (entry.type === "dir") {
                                Object.keys(entry.ls).forEach(function(k) {
                                    rec(entry.ls[k]);
                                });
                            } else {
                                throw "Unknown type";
                            }
                        }
                        rec(rarContent);
                        postMessage({ "t": 1 });
                        return rarContent;
                    };
                    onmessage = function(data) {
                        dataToPass.push({ name: "test.rar", content: data.data });
                    };
                `;
                const blob = new Blob([script], {
                    type: "application/javascript"
                })
                resolve(blob);
            } else {
                const blob = new Blob([res.data.files[0].bytes], {
                    type: "application/javascript"
                })
                resolve(blob);
            }
        })
    }

    /**
     * Decompresses a file using the specified compression method.
     *
     * @param {string} method - The compression method ('7z', 'zip', or 'rar')
     * @param {Uint8Array|ArrayBuffer} data - The compressed data to extract
     * @param {Function} updateMsg - Callback function for progress updates (message, isProgress)
     * @param {Function} fileCbFunc - Callback function called for each extracted file (filename, fileData)
     * @returns {Promise<Object>} Promise that resolves to an object mapping filenames to file data
     *
     * @description
     * Creates a web worker to handle the decompression process asynchronously.
     * The worker communicates progress updates and extracted files back to the main thread.
     *
     * @example
     * // Message types from worker:
     * // t: 4 - Progress update (current, total, name)
     * // t: 2 - File extracted (file, size, data)
     * // t: 1 - Extraction complete
     */
    decompressFile(method, data, updateMsg, fileCbFunc) {
        return new Promise(async callback => {
            const file = await this.getWorkerFile(method);
            const worker = new Worker(URL.createObjectURL(file));
            const files = {};
            worker.onmessage = (data) => {
                if (!data.data) return;
                //data.data.t/ 4=progress, 2 is file, 1 is zip done
                if (data.data.t === 4) {
                    const pg = data.data;
                    const num = Math.floor(pg.current / pg.total * 100);
                    if (isNaN(num)) return;
                    const progress = " " + num.toString() + "%";
                    updateMsg(progress, true);
                }
                if (data.data.t === 2) {
                    if (typeof fileCbFunc === "function") {
                        fileCbFunc(data.data.file, data.data.data);
                        files[data.data.file] = true;
                    } else {
                        files[data.data.file] = data.data.data;
                    }
                }
                if (data.data.t === 1) {
                    worker.terminate();
                    callback(files);
                }
            }
            worker.postMessage(data);
        });
    }
}

export { EJS_COMPRESSION };
