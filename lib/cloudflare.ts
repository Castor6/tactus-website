import { getCloudflareContext } from "@opennextjs/cloudflare";

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

export type R2Object = {
  body: ReadableStream;
  size: number;
  httpMetadata?: { contentType?: string };
  range?: { offset: number; length: number };
  writeHttpMetadata: (headers: Headers) => void;
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
  get: (
    key: string,
    options?: { range?: { offset: number; length: number } },
  ) => Promise<R2Object | null>;
  head: (key: string) => Promise<Omit<R2Object, "body"> | null>;
  delete: (key: string) => Promise<void>;
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
  const { env } = getCloudflareContext();

  return env as CloudflareEnv;
}
