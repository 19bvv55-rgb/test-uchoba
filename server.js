/* Минимальный статический сервер без зависимостей.
   Порт и хост задаются аргументами: node server.js --port 7100 --host 127.0.0.1 */
const http = require("http");
const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
function arg(name, fallback) {
  const i = args.indexOf("--" + name);
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
}
const PORT = parseInt(arg("port", process.env.PORT || "7100"), 10);
const HOST = arg("host", process.env.HOST || "127.0.0.1");
const ROOT = __dirname;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".ttf": "font/ttf",
  ".woff": "font/woff",
  ".woff2": "font/woff2"
};

http.createServer((req, res) => {
  let urlPath;
  try {
    urlPath = decodeURIComponent(req.url.split("?")[0]);
  } catch (e) {
    res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    return res.end("Некорректный запрос");
  }
  if (urlPath === "/") urlPath = "/index.html";

  const filePath = path.resolve(ROOT, "." + urlPath);
  if (filePath !== ROOT && !filePath.startsWith(ROOT + path.sep)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      return res.end("Не найдено");
    }
    res.writeHead(200, {
      "Content-Type": MIME[path.extname(filePath)] || "application/octet-stream",
      "X-Content-Type-Options": "nosniff"
    });
    res.end(data);
  });
}).listen(PORT, HOST, () => {
  console.log(`Лендинг v2 запущен: http://${HOST}:${PORT}/`);
});
