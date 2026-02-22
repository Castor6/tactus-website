import { getCloudflareEnv } from "@/lib/cloudflare";

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2 MB

type UploadZipInput = {
  key: string;
  file: File;
  uploadedBy: string;
};

type UploadImageInput = {
  key: string;
  file: File;
  uploadedBy: string;
};

export function createSkillFileKey(filename: string, userId: string) {
  const sanitizedName = filename
    .toLowerCase()
    .replace(/\.zip$/i, "")
    .replace(/[^a-z0-9-_.]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  const suffix = sanitizedName.length > 0 ? sanitizedName : "skill";
  return `skills/${userId}/${crypto.randomUUID()}-${suffix}.zip`;
}

export async function uploadZipToR2(input: UploadZipInput) {
  const env = getCloudflareEnv();

  const arrayBuffer = await input.file.arrayBuffer();
  await env.SKILLS_BUCKET.put(input.key, arrayBuffer, {
    httpMetadata: {
      contentType: input.file.type || "application/zip",
    },
    customMetadata: {
      uploadedBy: input.uploadedBy,
      originalName: input.file.name,
    },
  });

  return {
    key: input.key,
    size: input.file.size,
    contentType: input.file.type || "application/zip",
  };
}

export async function getSkillFile(key: string) {
  const env = getCloudflareEnv();
  const object = await env.SKILLS_BUCKET.get(key);

  if (!object) {
    return null;
  }

  return {
    body: object.body,
    size: object.size,
    contentType: object.httpMetadata?.contentType || "application/zip",
  };
}

export async function deleteSkillFile(key: string) {
  const env = getCloudflareEnv();
  await env.SKILLS_BUCKET.delete(key);
}

// ── Skill Image helpers ────────────────────────────────────

function imageExtension(contentType: string) {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
  };
  return map[contentType] ?? "jpg";
}

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return "仅支持 JPEG、PNG、WebP、GIF 格式的图片";
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return "图片大小不能超过 2MB";
  }
  if (file.size === 0) {
    return "图片文件为空";
  }
  return null;
}

export function createSkillImageKey(filename: string, userId: string) {
  const ext = imageExtension(
    filename.toLowerCase().endsWith(".png")
      ? "image/png"
      : filename.toLowerCase().endsWith(".webp")
        ? "image/webp"
        : filename.toLowerCase().endsWith(".gif")
          ? "image/gif"
          : "image/jpeg",
  );
  return `skills/${userId}/images/${crypto.randomUUID()}.${ext}`;
}

export async function uploadImageToR2(input: UploadImageInput) {
  const env = getCloudflareEnv();

  const arrayBuffer = await input.file.arrayBuffer();
  await env.SKILLS_BUCKET.put(input.key, arrayBuffer, {
    httpMetadata: {
      contentType: input.file.type || "image/jpeg",
    },
    customMetadata: {
      uploadedBy: input.uploadedBy,
      originalName: input.file.name,
    },
  });

  return {
    key: input.key,
    size: input.file.size,
    contentType: input.file.type || "image/jpeg",
  };
}

export async function getSkillImage(key: string) {
  const env = getCloudflareEnv();
  const object = await env.SKILLS_BUCKET.get(key);

  if (!object) {
    return null;
  }

  return {
    body: object.body,
    size: object.size,
    contentType: object.httpMetadata?.contentType || "image/jpeg",
  };
}

export async function deleteSkillImage(key: string) {
  const env = getCloudflareEnv();
  await env.SKILLS_BUCKET.delete(key);
}
