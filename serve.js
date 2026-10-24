// Local static server that sends the COOP/COEP headers required for SharedArrayBuffer (threads).
// Usage: node serve.js [port]   (open http://localhost:<port> — localhost counts as a secure context)
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const port = parseInt(process.argv[2] || process.env.PORT || "8081");

const types = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".mjs": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".map": "application/json; charset=utf-8",
    ".wasm": "application/wasm",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".ico": "image/x-icon",
};

http.createServer((req, res) => {
    const headers = {
        "Cross-Origin-Opener-Policy": "same-origin",
        "Cross-Origin-Embedder-Policy": "require-corp",
        "Cross-Origin-Resource-Policy": "same-origin",
        "Cache-Control": "no-cache",
    };
    let urlPath;
    try {
        urlPath = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    } catch {
        res.writeHead(400, headers).end("Bad request");
        return;
    }
    let file = path.join(root, path.normalize(urlPath));
    if (!file.startsWith(root)) {
        res.writeHead(403, headers).end("Forbidden");
        return;
    }
    fs.stat(file, (err, stat) => {
        if (!err && stat.isDirectory()) {
            file = path.join(file, "index.html");
            stat = fs.existsSync(file) ? fs.statSync(file) : null;
        }
        if (err || !stat) {
            res.writeHead(404, headers).end("Not found");
            return;
        }
        headers["Content-Type"] = types[path.extname(file).toLowerCase()] || "application/octet-stream";
        headers["Content-Length"] = stat.size;
        res.writeHead(200, headers);
        if (req.method === "HEAD") return res.end();
        fs.createReadStream(file).pipe(res);
    });
}).listen(port, () => {
    console.log(`EmulatorJS serving ${root} at http://localhost:${port} (COOP/COEP enabled)`);
});
