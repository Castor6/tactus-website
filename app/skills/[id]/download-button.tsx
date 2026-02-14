"use client";

import { useState } from "react";

type DownloadButtonProps = {
  skillId: string;
};

export function DownloadButton({ skillId }: DownloadButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/skills/${skillId}/download`);
      const payload = (await response.json()) as { downloadUrl?: string; error?: string };

      if (!response.ok || !payload.downloadUrl) {
        throw new Error(payload.error || "下载失败");
      }

      window.location.href = payload.downloadUrl;
    } catch (downloadError) {
      setError(downloadError instanceof Error ? downloadError.message : "下载失败");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        className="min-h-[44px] rounded-md bg-[var(--accent)] px-6 py-3 text-sm font-medium tracking-[0.05em] text-white transition-all duration-200 hover:bg-[var(--accent-secondary)] disabled:cursor-not-allowed disabled:opacity-70"
        disabled={isLoading}
        onClick={handleDownload}
        type="button"
      >
        {isLoading ? "正在生成下载链接..." : "下载 Skill"}
      </button>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
