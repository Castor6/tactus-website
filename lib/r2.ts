import { getCloudflareEnv } from "@/lib/cloudflare";

type UploadZipInput = {
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
