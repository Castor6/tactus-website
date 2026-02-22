"use client";

import { useRef, useState } from "react";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2 MB

type UploadPayload = {
  key: string;
  size: number;
  contentType: string;
};

type SkillPayload = {
  skill: {
    id: string;
    status: "pending" | "approved" | "rejected";
  };
};

export function SubmitForm() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  function handleImageChange(file: File | null) {
    if (!file) {
      setImage(null);
      setImagePreview(null);
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError("仅支持 JPEG、PNG、WebP、GIF 格式的图片");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setError("图片大小不能超过 2MB");
      return;
    }

    setError(null);
    setImage(file);
    const url = URL.createObjectURL(file);
    setImagePreview(url);
  }

  function clearImage() {
    setImage(null);
    setImagePreview(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name.trim() || !description.trim() || !file) {
      setError("请填写名称、描述并上传 zip 文件。");
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload zip file
      const uploadForm = new FormData();
      uploadForm.append("file", file);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: uploadForm,
      });
      const uploadPayload = (await uploadResponse.json()) as UploadPayload & { error?: string };

      if (!uploadResponse.ok) {
        throw new Error(uploadPayload.error || "上传失败");
      }

      // Upload image (optional)
      let imageKey: string | null = null;
      if (image) {
        const imageForm = new FormData();
        imageForm.append("image", image);

        const imageResponse = await fetch("/api/upload-image", {
          method: "POST",
          body: imageForm,
        });
        const imagePayload = (await imageResponse.json()) as UploadPayload & { error?: string };

        if (!imageResponse.ok) {
          throw new Error(imagePayload.error || "图片上传失败");
        }
        imageKey = imagePayload.key;
      }

      // Create skill record
      const createResponse = await fetch("/api/skills", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          fileKey: uploadPayload.key,
          fileSize: uploadPayload.size,
          imageKey,
        }),
      });
      const createPayload = (await createResponse.json()) as SkillPayload & { error?: string };

      if (!createResponse.ok) {
        throw new Error(createPayload.error || "创建 skill 失败");
      }

      setSuccess("提交成功，请等待管理员审核。");
      setName("");
      setDescription("");
      setFile(null);
      clearImage();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "提交失败");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="mt-8 grid gap-5 rounded-lg border border-[var(--border)] bg-white p-6" onSubmit={handleSubmit}>
      <label className="grid gap-2">
        <span className="small-caps text-[var(--muted-foreground)]">Skill 名称</span>
        <input
          className="min-h-[44px] rounded-md border border-[var(--border)] px-4 py-2 outline-none transition-all duration-150 focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--ring)]"
          onChange={(event) => setName(event.target.value)}
          placeholder="例如：MCP Notion Sync"
          type="text"
          value={name}
        />
      </label>

      <label className="grid gap-2">
        <span className="small-caps text-[var(--muted-foreground)]">描述</span>
        <textarea
          className="min-h-36 rounded-md border border-[var(--border)] px-4 py-3 outline-none transition-all duration-150 focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--ring)]"
          onChange={(event) => setDescription(event.target.value)}
          placeholder="简要说明 skill 的功能和使用场景"
          value={description}
        />
      </label>

      <label className="grid gap-2">
        <span className="small-caps text-[var(--muted-foreground)]">封面图片（可选，最大 2MB）</span>
        <input
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="min-h-[44px] rounded-md border border-[var(--border)] px-4 py-2 text-sm"
          onChange={(event) => handleImageChange(event.target.files?.[0] ?? null)}
          ref={imageInputRef}
          type="file"
        />
        {imagePreview ? (
          <div className="relative mt-2 inline-block">
            <img
              alt="封面预览"
              className="h-40 w-auto rounded-md border border-[var(--border)] object-cover"
              src={imagePreview}
            />
            <button
              className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white shadow hover:bg-red-600"
              onClick={clearImage}
              type="button"
            >
              ✕
            </button>
          </div>
        ) : null}
      </label>

      <label className="grid gap-2">
        <span className="small-caps text-[var(--muted-foreground)]">Zip 压缩包</span>
        <input
          accept=".zip,application/zip,application/x-zip-compressed"
          className="min-h-[44px] rounded-md border border-[var(--border)] px-4 py-2 text-sm"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          type="file"
        />
      </label>

      <button
        className="mt-2 min-h-[44px] w-fit rounded-md bg-[var(--accent)] px-6 py-3 text-sm font-medium tracking-[0.05em] text-white transition-all duration-200 hover:bg-[var(--accent-secondary)] disabled:cursor-not-allowed disabled:opacity-70"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "提交中..." : "提交审核"}
      </button>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {success ? <p className="text-sm text-green-700">{success}</p> : null}
    </form>
  );
}
