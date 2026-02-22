import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getApprovedSkillById } from "@/lib/db";
import { ImageCarousel } from "./image-carousel";
import { SkillActions } from "./skill-actions";

type Params = Promise<{
  id: string;
}>;

function formatDate(date: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date));
}

export default async function SkillDetailPage(props: {
  params: Params;
}) {
  const params = await props.params;

  const skill = await getApprovedSkillById(params.id);
  if (!skill) {
    notFound();
  }

  const session = await auth();
  const isOwner = session?.user?.id === skill.authorId;
  const imageVersion = new Date(skill.updatedAt ?? skill.createdAt).getTime();

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-14 sm:px-10">
      <Link className="small-caps text-[var(--accent)]" href="/skills">
        返回 Skills 广场
      </Link>

      <section className="mt-6 overflow-hidden rounded-lg border border-[var(--border)] border-t-2 border-t-[var(--accent)] bg-white shadow-[0_1px_2px_rgba(26,26,26,0.04)]">
        {skill.imageKeys.length > 0 ? (
          <ImageCarousel
            alt={skill.name}
            imageUrls={skill.imageKeys.map((_, i) => `/api/skills/${skill.id}/image?index=${i}&v=${imageVersion}`)}
          />
        ) : null}
        <div className="p-8">
        <h1 className="headline-serif text-4xl text-[var(--foreground)]">{skill.name}</h1>
        <p className="mt-3 text-lg text-[var(--muted-foreground)]">{skill.description}</p>

        <div className="mt-6 flex flex-wrap items-center gap-6 text-sm text-[var(--muted-foreground)]">
          <div className="flex items-center gap-2">
            <Image
              alt={`${skill.authorName} avatar`}
              className="h-9 w-9 rounded-full border border-[var(--border)] object-cover"
              height={36}
              src={skill.authorAvatar || "/images/show-result.png"}
              unoptimized
              width={36}
            />
            <span>{skill.authorName}</span>
          </div>
          <span>{skill.downloads.toLocaleString()} 次下载</span>
          <span>上传时间: {formatDate(skill.createdAt)}</span>
          {skill.updatedAt ? (
            <span>更新时间: {formatDate(skill.updatedAt)}</span>
          ) : null}
        </div>

        <SkillActions
          currentDescription={skill.description}
          currentImageKeys={skill.imageKeys}
          currentImageUrls={skill.imageKeys.map((_, i) => `/api/skills/${skill.id}/image?index=${i}&v=${imageVersion}`)}
          currentName={skill.name}
          isOwner={isOwner}
          skillId={skill.id}
        />
        </div>
      </section>
    </main>
  );
}
