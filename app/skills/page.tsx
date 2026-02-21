import Image from "next/image";
import Link from "next/link";
import { listApprovedSkills } from "@/lib/db";

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

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-14 sm:px-10">
      <div className="mb-2 flex items-center gap-4">
        <span className="section-rule" />
        <span className="small-caps whitespace-nowrap text-[var(--accent)]">Skills Market</span>
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
            className="rounded-lg border border-[var(--border)] border-t-2 border-t-[var(--accent)] bg-white p-6 shadow-[0_1px_2px_rgba(26,26,26,0.04)]"
            key={skill.id}
          >
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
              <Link
                className="small-caps text-[var(--accent)] underline decoration-[var(--accent)]"
                href={`/skills/${skill.id}`}
              >
                查看详情
              </Link>
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
