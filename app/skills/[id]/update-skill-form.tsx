"use client";

import { useState } from "react";

type UpdateFormProps = {
  skillId: string;
  currentName: string;
  currentDescription: string;
  onOpenChange?: (isOpen: boolean) => void;
};

export function UpdateSkillForm({ skillId, currentName, currentDescription, onOpenChange }: UpdateFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(currentName);
  const [description, setDescription] = useState(currentDescription);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      if (name.trim() && name.trim() !== currentName) {
        formData.append("name", name.trim());
      }
      if (description.trim() && description.trim() !== currentDescription) {
        formData.append("description", description.trim());
      }
      if (file) {
        formData.append("file", file);
      }

      const response = await fetch(`/api/skills/${skillId}`, {
        method: "PUT",
        body: formData,
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error || "更新失败");
      }

      setSuccess("更新成功！");
      setFile(null);
      setIsOpen(false);
      onOpenChange?.(false);
      setTimeout(() => window.location.reload(), 1000);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "更新失败");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen) {
    return (
      <button
        className="min-h-[44px] rounded-md border border-[var(--accent)] px-6 py-3 text-center text-sm font-medium tracking-[0.05em] text-[var(--accent)] transition-all duration-200 hover:bg-[var(--accent)] hover:text-white"
        onClick={() => {
          setIsOpen(true);
          onOpenChange?.(true);
        }}
        type="button"
      >
        更新 Skill
      </button>
    );
  }

  return (
    <form className="mt-6 grid gap-4 rounded-lg border border-[var(--border)] bg-[var(--background)] p-6" onSubmit={handleSubmit}>
      <h3 className="headline-serif text-xl text-[var(--foreground)]">更新 Skill</h3>

      <label className="grid gap-2">
        <span className="small-caps text-[var(--muted-foreground)]">名称</span>
        <input
          className="min-h-[44px] rounded-md border border-[var(--border)] bg-white px-4 py-2 outline-none transition-all duration-150 focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--ring)]"
          onChange={(e) => setName(e.target.value)}
          type="text"
          value={name}
        />
      </label>

      <label className="grid gap-2">
        <span className="small-caps text-[var(--muted-foreground)]">描述</span>
        <textarea
          className="min-h-24 rounded-md border border-[var(--border)] bg-white px-4 py-3 outline-none transition-all duration-150 focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--ring)]"
          onChange={(e) => setDescription(e.target.value)}
          value={description}
        />
      </label>

      <label className="grid gap-2">
        <span className="small-caps text-[var(--muted-foreground)]">替换 Zip 压缩包（可选）</span>
        <input
          accept=".zip,application/zip,application/x-zip-compressed"
          className="min-h-[44px] rounded-md border border-[var(--border)] bg-white px-4 py-2 text-sm"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          type="file"
        />
      </label>

      <div className="flex gap-3">
        <button
          className="min-h-[44px] rounded-md bg-[var(--accent)] px-6 py-3 text-sm font-medium tracking-[0.05em] text-white transition-all duration-200 hover:bg-[var(--accent-secondary)] disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "更新中..." : "确认更新"}
        </button>
        <button
          className="min-h-[44px] rounded-md border border-[var(--border)] px-6 py-3 text-sm font-medium tracking-[0.05em] text-[var(--muted-foreground)] transition-all duration-200 hover:bg-[var(--muted)]"
          disabled={isSubmitting}
          onClick={() => {
            setIsOpen(false);
            onOpenChange?.(false);
            setName(currentName);
            setDescription(currentDescription);
            setFile(null);
            setError(null);
            setSuccess(null);
          }}
          type="button"
        >
          取消
        </button>
      </div>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {success ? <p className="text-sm text-green-700">{success}</p> : null}
    </form>
  );
}
