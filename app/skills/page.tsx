import Image from "next/image";
import Link from "next/link";
import { auth } from "@/auth";
import { getSkillLikeCounts, getUserLikedSkillIds, listApprovedSkills } from "@/lib/db";
import { LikeButton } from "./like-button";

type SearchParams = Promise<{
  q?: string;
}>;

function formatDate(date: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date));
}

export default async function SkillsPage(props: {
  searchParams: SearchParams;
}) {
  const searchParams = await props.searchParams;
  const keyword = searchParams.q?.trim() ?? "";
  const skills = await listApprovedSkills(keyword || undefined);

  const session = await auth();
  const userId = session?.user?.id;
  const skillIds = skills.map((s) => s.id);

  const [likeCounts, userLikedIds] = await Promise.all([
    getSkillLikeCounts(skillIds),
    userId ? getUserLikedSkillIds(userId, skillIds) : Promise.resolve(new Set<string>()),
  ]);

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-14 sm:px-10">
      <div className="mb-2 flex items-center gap-4">
        <span className="section-rule" />
        <span className="small-caps whitespace-nowrap text-[var(--accent)]">Skills Plaza</span>
        <span className="section-rule" />
      </div>

      <h1 className="headline-serif text-4xl text-[var(--foreground)] sm:text-5xl">Skills 广场</h1>
      <p className="mt-4 max-w-3xl text-[var(--muted-foreground)]">无需登录即可浏览和下载已审核通过的 skills。</p>

      <form className="mt-8 flex flex-col gap-4 sm:flex-row" method="get">
        <input
          className="min-h-[44px] flex-1 rounded-md border border-[var(--border)] bg-white px-4 py-2 text-base text-[var(--foreground)] outline-none transition-all duration-150 placeholder:text-[var(--muted-foreground)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--ring)]"
          defaultValue={searchParams.q}
          name="q"
          placeholder="搜索 skill 名称或描述"
          type="search"
        />
        <button
          className="min-h-[44px] rounded-md bg-[var(--accent)] px-6 py-2 text-sm font-medium tracking-[0.05em] text-white transition-all duration-200 hover:bg-[var(--accent-secondary)]"
          type="submit"
        >
          搜索
        </button>
      </form>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {skills.map((skill) => (
          <article
            className="overflow-hidden rounded-lg border border-[var(--border)] border-t-2 border-t-[var(--accent)] bg-white shadow-[0_1px_2px_rgba(26,26,26,0.04)]"
            key={skill.id}
          >
            {skill.imageKey ? (
              <Link href={`/skills/${skill.id}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt={`${skill.name} cover`}
                  className="h-40 w-full object-cover"
                  loading="lazy"
                  src={`/api/skills/${skill.id}/image`}
                />
              </Link>
            ) : null}
            <div className="p-6">
            <h2 className="headline-serif text-2xl text-[var(--foreground)]">{skill.name}</h2>
            <p className="mt-2 text-[var(--muted-foreground)]">{skill.description}</p>

            <div className="mt-5 flex items-center justify-between text-sm text-[var(--muted-foreground)]">
              <div className="flex items-center gap-2">
                <Image
                  alt={`${skill.authorName} avatar`}
                  className="h-8 w-8 rounded-full border border-[var(--border)] object-cover"
                  height={32}
                  src={skill.authorAvatar || "/images/show-result.png"}
                  unoptimized
                  width={32}
                />
                <span>{skill.authorName}</span>
              </div>
              <span>{skill.downloads.toLocaleString()} downloads</span>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="small-caps text-[var(--muted-foreground)]">
                {skill.updatedAt ? `更新于 ${formatDate(skill.updatedAt)}` : formatDate(skill.createdAt)}
              </span>
              <div className="flex items-center gap-3">
                <LikeButton
                  initialCount={likeCounts[skill.id] ?? 0}
                  initialLiked={userLikedIds.has(skill.id)}
                  loggedIn={!!userId}
                  skillId={skill.id}
                />
                <a
                  className="small-caps inline-flex items-center gap-1 rounded-md bg-[var(--accent)] px-3 py-1.5 text-xs font-medium tracking-[0.05em] text-white transition-all duration-200 hover:bg-[var(--accent-secondary)]"
                  href={`/api/skills/${skill.id}/download`}
                >
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeLinecap="round" strokeLinejoin="round" />
                    <polyline points="7 10 12 15 17 10" strokeLinecap="round" strokeLinejoin="round" />
                    <line strokeLinecap="round" strokeLinejoin="round" x1="12" x2="12" y1="15" y2="3" />
                  </svg>
                  下载
                </a>
                <Link
                  className="small-caps text-[var(--accent)] underline decoration-[var(--accent)]"
                  href={`/skills/${skill.id}`}
                >
                  查看详情
                </Link>
              </div>
            </div>
            </div>
          </article>
        ))}
      </div>

      {skills.length === 0 ? (
        <p className="mt-10 rounded-md border border-[var(--border)] bg-white p-6 text-[var(--muted-foreground)]">
          未找到匹配结果，请尝试其他关键词。
        </p>
      ) : null}
    </main>
  );
}
