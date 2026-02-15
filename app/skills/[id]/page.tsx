import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getApprovedSkillById } from "@/lib/db";
import { DownloadButton } from "./download-button";

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

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-14 sm:px-10">
      <Link className="small-caps text-[var(--accent)]" href="/skills">
        返回 Skills 市场
      </Link>

      <section className="mt-6 rounded-lg border border-[var(--border)] border-t-2 border-t-[var(--accent)] bg-white p-8 shadow-[0_1px_2px_rgba(26,26,26,0.04)]">
        <h1 className="headline-serif text-4xl text-[var(--foreground)]">{skill.name}</h1>
        <p className="mt-3 text-lg text-[var(--muted-foreground)]">{skill.description}</p>

        <div className="mt-6 flex flex-wrap items-center gap-6 text-sm text-[var(--muted-foreground)]">
          <div className="flex items-center gap-2">
            <Image
              alt={`${skill.authorName} avatar`}
              className="h-9 w-9 rounded-full border border-[var(--border)] object-cover"
              height={36}
              src={skill.authorAvatar || "/images/show-result.png"}
              width={36}
            />
            <span>{skill.authorName}</span>
          </div>
          <span>{skill.downloads.toLocaleString()} 次下载</span>
          <span>上传时间: {formatDate(skill.createdAt)}</span>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <DownloadButton skillId={skill.id} />
          <Link
            className="min-h-[44px] rounded-md border border-[var(--foreground)] px-6 py-3 text-center text-sm font-medium tracking-[0.05em] text-[var(--foreground)] transition-all duration-200 hover:border-[var(--accent)] hover:text-[var(--accent)]"
            href="/skills"
          >
            浏览更多 Skills
          </Link>
        </div>
      </section>
    </main>
  );
}
