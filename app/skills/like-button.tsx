"use client";

import { useState, useTransition } from "react";

type LikeButtonProps = {
  skillId: string;
  initialLiked: boolean;
  initialCount: number;
  loggedIn: boolean;
};

export function LikeButton({ skillId, initialLiked, initialCount, loggedIn }: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!loggedIn) return;

    startTransition(async () => {
      try {
        const res = await fetch(`/api/skills/${skillId}/like`, { method: "POST" });
        if (res.ok) {
          const data: { liked: boolean; count: number } = await res.json();
          setLiked(data.liked);
          setCount(data.count);
        }
      } catch {
        // silently ignore
      }
    });
  }

  return (
    <button
      className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-all duration-200 ${
        liked
          ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
          : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
      } ${!loggedIn ? "cursor-default opacity-60" : "cursor-pointer"} ${isPending ? "opacity-50" : ""}`}
      disabled={isPending || !loggedIn}
      onClick={handleClick}
      title={loggedIn ? (liked ? "取消点赞" : "点赞") : "请先登录"}
      type="button"
    >
      <svg
        className="h-3.5 w-3.5"
        fill={liked ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path
          d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {count > 0 ? count : ""}
    </button>
  );
}
