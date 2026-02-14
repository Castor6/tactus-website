"use client";

import { useEffect, useState } from "react";
import type { Skill } from "@/lib/db";

export function AdminReviewPanel() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function loadPendingSkills() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/skills");
      const payload = (await response.json()) as { skills?: Skill[]; error?: string };

      if (!response.ok || !payload.skills) {
        throw new Error(payload.error || "加载待审核列表失败");
      }

      setSkills(payload.skills);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }

  async function reviewSkill(id: string, status: "approved" | "rejected") {
    setUpdatingId(id);
    setError(null);

    try {
      const response = await fetch("/api/admin/skills", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, status }),
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error || "审核失败");
      }

      setSkills((currentSkills) => currentSkills.filter((skill) => skill.id !== id));
    } catch (reviewError) {
      setError(reviewError instanceof Error ? reviewError.message : "审核失败");
    } finally {
      setUpdatingId(null);
    }
  }

  useEffect(() => {
    void loadPendingSkills();
  }, []);

  if (loading) {
    return (
      <p className="mt-8 rounded-md border border-[var(--border)] bg-white p-6 text-[var(--muted-foreground)]">
        正在加载待审核技能...
      </p>
    );
  }

  return (
    <section className="mt-8 space-y-4">
      {error ? <p className="rounded-md border border-red-300 bg-red-50 p-4 text-sm text-red-700">{error}</p> : null}

      {skills.map((skill) => (
        <article
          className="rounded-lg border border-[var(--border)] border-t-2 border-t-[var(--accent)] bg-white p-6"
          key={skill.id}
        >
          <h2 className="headline-serif text-2xl text-[var(--foreground)]">{skill.name}</h2>
          <p className="mt-2 text-[var(--muted-foreground)]">{skill.description}</p>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <span className="small-caps text-[var(--muted-foreground)]">提交者: {skill.authorName}</span>
            <div className="flex gap-3">
              <button
                className="min-h-[44px] rounded-md bg-[var(--accent)] px-4 py-2 text-xs tracking-[0.08em] text-white disabled:cursor-not-allowed disabled:opacity-70"
                disabled={updatingId === skill.id}
                onClick={() => void reviewSkill(skill.id, "approved")}
                type="button"
              >
                通过
              </button>
              <button
                className="min-h-[44px] rounded-md border border-[var(--foreground)] px-4 py-2 text-xs tracking-[0.08em] text-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-70"
                disabled={updatingId === skill.id}
                onClick={() => void reviewSkill(skill.id, "rejected")}
                type="button"
              >
                拒绝
              </button>
            </div>
          </div>
        </article>
      ))}

      {skills.length === 0 ? (
        <p className="rounded-md border border-[var(--border)] bg-white p-6 text-[var(--muted-foreground)]">
          当前没有待审核 skill。
        </p>
      ) : null}
    </section>
  );
}
