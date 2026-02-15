import { getCloudflareEnv } from "@/lib/cloudflare";

const CONTENT_TYPES: Record<string, string> = {
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".ogg": "video/ogg",
  ".mov": "video/quicktime",
};

type RouteContext = {
  params: Promise<{ key: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { key } = await context.params;

  const env = getCloudflareEnv();
  const rangeHeader = request.headers.get("range");

  const ext = key.substring(key.lastIndexOf(".")).toLowerCase();
  const contentType = CONTENT_TYPES[ext] ?? "application/octet-stream";

  if (!rangeHeader) {
    const object = await env.SKILLS_BUCKET.get(key);
    if (!object) {
      return new Response("Not Found", { status: 404 });
    }

    return new Response(object.body, {
      headers: {
        "content-type": contentType,
        "content-length": String(object.size),
        "accept-ranges": "bytes",
        "cache-control": "public, max-age=31536000",
      },
    });
  }

  // Parse Range header: bytes=start-end
  const match = rangeHeader.match(/bytes=(\d+)-(\d*)/);
  if (!match) {
    return new Response("Invalid Range", { status: 416 });
  }

  // HEAD to get total size
  const head = await env.SKILLS_BUCKET.head(key);
  if (!head) {
    return new Response("Not Found", { status: 404 });
  }

  const totalSize = head.size;
  const start = parseInt(match[1], 10);
  const end = match[2] ? parseInt(match[2], 10) : totalSize - 1;

  if (start >= totalSize || end >= totalSize) {
    return new Response("Range Not Satisfiable", {
      status: 416,
      headers: { "content-range": `bytes */${totalSize}` },
    });
  }

  const length = end - start + 1;
  const object = await env.SKILLS_BUCKET.get(key, {
    range: { offset: start, length },
  });
  if (!object) {
    return new Response("Not Found", { status: 404 });
  }

  return new Response(object.body, {
    status: 206,
    headers: {
      "content-type": contentType,
      "content-range": `bytes ${start}-${end}/${totalSize}`,
      "content-length": String(length),
      "accept-ranges": "bytes",
      "cache-control": "public, max-age=31536000",
    },
  });
}
