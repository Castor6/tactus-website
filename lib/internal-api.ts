import { headers } from "next/headers";

export async function fetchInternalApi<T>(path: string, init?: RequestInit) {
  const requestHeaders = await headers();
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");

  if (!host) {
    throw new Error("Missing host header");
  }

  const response = await fetch(`${protocol}://${host}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Internal API request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}
