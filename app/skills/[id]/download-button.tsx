"use client";

type DownloadButtonProps = {
  skillId: string;
};

export function DownloadButton({ skillId }: DownloadButtonProps) {
  return (
    <a
      className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-[var(--accent)] px-6 py-3 text-sm font-medium tracking-[0.05em] text-white transition-all duration-200 hover:bg-[var(--accent-secondary)]"
      href={`/api/skills/${skillId}/download`}
    >
      下载 Skill
    </a>
  );
}
