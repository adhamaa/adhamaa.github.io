/**
 * Serves the static export in `out/` over HTTP, the way GitHub Pages does.
 *
 * Deliberately dependency-free and written in plain Node: the smoke suite exists
 * to police framework upgrades, so nothing in it may depend on the framework,
 * the bundler or the styling toolchain being upgraded.
 *
 * Usage: node e2e/static-server.mjs [port] [rootDir]
 */
import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { extname, join, normalize, resolve, sep } from "node:path";

const port = Number(process.argv[2] ?? process.env.PORT ?? 4321);
const root = resolve(process.argv[3] ?? "out");

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".pdf": "application/pdf",
};

/** Resolve a URL path to a file inside `root`, or null if it escapes or is missing. */
async function resolveFile(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0].split("#")[0]);
  const withinRoot = normalize(join(root, decoded));
  if (withinRoot !== root && !withinRoot.startsWith(root + sep)) return null;

  // `output: "export"` emits flat files, so `/about` lives at `out/about.html`.
  const candidates = withinRoot.endsWith(sep)
    ? [join(withinRoot, "index.html")]
    : [withinRoot, `${withinRoot}.html`, join(withinRoot, "index.html")];

  for (const candidate of candidates) {
    try {
      const stats = await stat(candidate);
      if (stats.isFile()) return candidate;
    } catch {
      // Try the next candidate.
    }
  }
  return null;
}

const server = createServer(async (request, response) => {
  const file = await resolveFile(request.url ?? "/");

  if (!file) {
    const notFound = await resolveFile("/404.html");
    response.writeHead(404, { "content-type": contentTypes[".html"] });
    if (notFound) return createReadStream(notFound).pipe(response);
    return response.end("Not found");
  }

  response.writeHead(200, {
    "content-type": contentTypes[extname(file).toLowerCase()] ?? "application/octet-stream",
  });
  createReadStream(file).pipe(response);
});

server.listen(port, () => {
  console.log(`Serving ${root} on http://localhost:${port}`);
});
