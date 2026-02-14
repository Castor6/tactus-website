import { mockSkills } from "../skills/data";

const pendingSkills = mockSkills.filter((skill) => skill.status === "pending");

export default function AdminPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-14 sm:px-10">
      <div className="mb-2 flex items-center gap-4">
        <span className="section-rule" />
        <span className="small-caps whitespace-nowrap text-[var(--accent)]">Admin</span>
        <span className="section-rule" />
      </div>

      <h1 className="headline-serif text-4xl text-[var(--foreground)] sm:text-5xl">审核后台</h1>
      <p className="mt-4 text-[var(--muted-foreground)]">
        该页面将接入 GitHub 登录和管理员白名单校验（`ADMIN_GITHUB_IDS`）。
      </p>

      <section className="mt-8 space-y-4">
        {pendingSkills.map((skill) => (
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
                  className="min-h-[44px] rounded-md bg-[var(--accent)] px-4 py-2 text-xs tracking-[0.08em] text-white"
                  type="button"
                >
                  通过（待接入）
                </button>
                <button
                  className="min-h-[44px] rounded-md border border-[var(--foreground)] px-4 py-2 text-xs tracking-[0.08em] text-[var(--foreground)]"
                  type="button"
                >
                  拒绝（待接入）
                </button>
              </div>
            </div>
          </article>
        ))}

        {pendingSkills.length === 0 ? (
          <p className="rounded-md border border-[var(--border)] bg-white p-6 text-[var(--muted-foreground)]">
            当前没有待审核 skill。
          </p>
        ) : null}
      </section>
    </main>
  );
}
