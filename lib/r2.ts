import { AwsClient } from "aws4fetch";
import { getCloudflareEnv } from "@/lib/cloudflare";

type UploadZipInput = {
  key: string;
  file: File;
  uploadedBy: string;
};

function getPresignClient() {
  const env = getCloudflareEnv();

  return new AwsClient({
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    service: "s3",
    region: "auto",
  });
}

function encodeObjectKey(key: string) {
  return key
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

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

export async function getSignedDownloadUrl(key: string, expiresInSeconds = 300) {
  const env = getCloudflareEnv();
  const presignClient = getPresignClient();

  const url = new URL(
    `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${env.R2_BUCKET_NAME}/${encodeObjectKey(key)}`,
  );
  url.searchParams.set("X-Amz-Expires", String(expiresInSeconds));

  const signedRequest = await presignClient.sign(new Request(url.toString(), { method: "GET" }), {
    aws: {
      signQuery: true,
    },
  });

  return signedRequest.url.toString();
}
