// Local static server that sends the COOP/COEP headers required for SharedArrayBuffer (threads).
// Usage: node serve.js [port] [--cert cert.pem --key key.pem]
// Over plain http only localhost is a secure context; pass a certificate (e.g. from mkcert) to serve
// https so other devices on the network get SharedArrayBuffer too.
import http from "node:http";
import https from "node:https";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

const root = path.dirname(fileURLToPath(import.meta.url));
const { values: args, positionals } = parseArgs({
    options: { cert: { type: "string" }, key: { type: "string" } },
    allowPositionals: true,
});
const port = parseInt(positionals[0] || process.env.PORT || "8081");
if (!args.cert !== !args.key) {
    console.error("--cert and --key must be given together");
    process.exit(1);
}
const secure = Boolean(args.cert);

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

const handler = (req, res) => {
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
        headers["Accept-Ranges"] = "bytes";
        // a single byte range, as cores that stream large discs request them
        const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || "");
        if (range && (range[1] || range[2])) {
            let start = range[1] ? parseInt(range[1]) : Math.max(0, stat.size - parseInt(range[2]));
            let end = range[1] && range[2] ? Math.min(parseInt(range[2]), stat.size - 1) : stat.size - 1;
            if (start > end || start >= stat.size) {
                headers["Content-Range"] = `bytes */${stat.size}`;
                res.writeHead(416, headers).end();
                return;
            }
            headers["Content-Range"] = `bytes ${start}-${end}/${stat.size}`;
            headers["Content-Length"] = end - start + 1;
            res.writeHead(206, headers);
            if (req.method === "HEAD") return res.end();
            fs.createReadStream(file, { start, end }).pipe(res);
            return;
        }
        headers["Content-Length"] = stat.size;
        res.writeHead(200, headers);
        if (req.method === "HEAD") return res.end();
        fs.createReadStream(file).pipe(res);
    });
};

const server = secure
    ? https.createServer({ cert: fs.readFileSync(args.cert), key: fs.readFileSync(args.key) }, handler)
    : http.createServer(handler);

server.listen(port, () => {
    const scheme = secure ? "https" : "http";
    console.log(`EmulatorJS serving ${root} (COOP/COEP enabled)`);
    console.log(`  ${scheme}://localhost:${port}`);
    if (secure) {
        for (const addrs of Object.values(os.networkInterfaces())) {
            for (const a of addrs) {
                if (a.family === "IPv4" && !a.internal) console.log(`  ${scheme}://${a.address}:${port}`);
            }
        }
    }
});
