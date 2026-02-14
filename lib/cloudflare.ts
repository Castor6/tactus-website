import { getRequestContext } from "@cloudflare/next-on-pages";

export type D1PreparedStatement = {
  bind: (...values: unknown[]) => D1PreparedStatement;
  all: <T = unknown>() => Promise<{ results: T[] }>;
  first: <T = unknown>() => Promise<T | null>;
  run: () => Promise<unknown>;
};

export type D1DatabaseBinding = {
  prepare: (query: string) => D1PreparedStatement;
  batch: <T = unknown>(statements: D1PreparedStatement[]) => Promise<T[]>;
};

export type R2BucketBinding = {
  put: (
    key: string,
    value: ReadableStream | ArrayBuffer | ArrayBufferView | string | Blob,
    options?: {
      httpMetadata?: { contentType?: string };
      customMetadata?: Record<string, string>;
    },
  ) => Promise<unknown>;
  get: (key: string) => Promise<unknown | null>;
};

export type CloudflareEnv = {
  DB: D1DatabaseBinding;
  SKILLS_BUCKET: R2BucketBinding;
  R2_ACCOUNT_ID: string;
  R2_BUCKET_NAME: string;
  R2_ACCESS_KEY_ID: string;
  R2_SECRET_ACCESS_KEY: string;
};

export function getCloudflareEnv() {
  const { env } = getRequestContext();

  return env as CloudflareEnv;
}
