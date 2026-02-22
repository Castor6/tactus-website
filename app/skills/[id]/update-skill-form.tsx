"use client";

import { useRef, useState } from "react";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2 MB
const MAX_IMAGES = 5;

type UpdateFormProps = {
  skillId: string;
  currentName: string;
  currentDescription: string;
  currentImageUrls: string[];
  currentImageKeys: string[];
  onOpenChange?: (isOpen: boolean) => void;
};

type ImageItem = {
  type: "existing";
  url: string;
  key: string;
} | {
  type: "new";
  file: File;
  previewUrl: string;
};

export function UpdateSkillForm({ skillId, currentName, currentDescription, currentImageUrls, currentImageKeys, onOpenChange }: UpdateFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(currentName);
  const [description, setDescription] = useState(currentDescription);
  const [file, setFile] = useState<File | null>(null);
  const [imageItems, setImageItems] = useState<ImageItem[]>(() =>
    currentImageKeys.map((key, i) => ({ type: "existing" as const, url: currentImageUrls[i] ?? "", key })),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  function handleImagesChange(files: FileList | null) {
    if (!files || files.length === 0) return;

    const remaining = MAX_IMAGES - imageItems.length;
    if (remaining <= 0) {
      setError(`最多上传 ${MAX_IMAGES} 张图片`);
      return;
    }

    const newItems: ImageItem[] = [];

    for (let i = 0; i < Math.min(files.length, remaining); i++) {
      const f = files[i];
      if (!ALLOWED_IMAGE_TYPES.includes(f.type)) {
        setError("仅支持 JPEG、PNG、WebP、GIF 格式的图片");
        return;
      }
      if (f.size > MAX_IMAGE_SIZE) {
        setError("图片大小不能超过 2MB");
        return;
      }
      newItems.push({ type: "new", file: f, previewUrl: URL.createObjectURL(f) });
    }

    if (files.length > remaining) {
      setError(`已选择前 ${remaining} 张，最多上传 ${MAX_IMAGES} 张图片`);
    } else {
      setError(null);
    }

    setImageItems((prev) => [...prev, ...newItems]);

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  }

  function removeImageItem(index: number) {
    setImageItems((prev) => {
      const item = prev[index];
      if (item.type === "new") {
        URL.revokeObjectURL(item.previewUrl);
      }
      return prev.filter((_, i) => i !== index);
    });
  }

  function resetImages() {
    imageItems.forEach((item) => {
      if (item.type === "new") URL.revokeObjectURL(item.previewUrl);
    });
    setImageItems(
      currentImageKeys.map((key, i) => ({ type: "existing" as const, url: currentImageUrls[i] ?? "", key })),
    );
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  }

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

      // Separate existing kept keys and new files
      const keptKeys = imageItems.filter((item) => item.type === "existing").map((item) => (item as { type: "existing"; key: string }).key);
      const newFiles = imageItems.filter((item) => item.type === "new").map((item) => (item as { type: "new"; file: File }).file);

      // Always send keptImageKeys so the server knows which existing images to keep
      formData.append("keptImageKeys", JSON.stringify(keptKeys));

      // Append new images
      for (const newFile of newFiles) {
        formData.append("images", newFile);
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

      <div className="grid gap-2">
        <span className="small-caps text-[var(--muted-foreground)]">
          封面图片（最多 {MAX_IMAGES} 张，每张最大 2MB）
        </span>
        <span className="text-xs text-[var(--muted-foreground)]">
          当前 {imageItems.length}/{MAX_IMAGES} 张
        </span>
        {imageItems.length > 0 ? (
          <div className="mt-1 flex flex-wrap gap-3">
            {imageItems.map((item, index) => (
              <div className="relative" key={item.type === "existing" ? item.key : item.previewUrl}>
                <img
                  alt={`图片 ${index + 1}`}
                  className="h-24 w-24 rounded-md border border-[var(--border)] object-cover"
                  src={item.type === "existing" ? item.url : item.previewUrl}
                />
                <button
                  className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white shadow hover:bg-red-600"
                  onClick={() => removeImageItem(index)}
                  type="button"
                >
                  ✕
                </button>
                {item.type === "new" ? (
                  <span className="absolute bottom-0.5 left-0.5 rounded bg-[var(--accent)] px-1 text-[10px] text-white">
                    新
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}
        {imageItems.length < MAX_IMAGES ? (
          <input
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="min-h-[44px] rounded-md border border-[var(--border)] bg-white px-4 py-2 text-sm"
            multiple
            onChange={(e) => handleImagesChange(e.target.files)}
            ref={imageInputRef}
            type="file"
          />
        ) : null}
      </div>

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
            resetImages();
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
