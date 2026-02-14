export default function SubmitSkillPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-14 sm:px-10">
      <div className="mb-2 flex items-center gap-4">
        <span className="section-rule" />
        <span className="small-caps whitespace-nowrap text-[var(--accent)]">Submit Skill</span>
        <span className="section-rule" />
      </div>

      <h1 className="headline-serif text-4xl text-[var(--foreground)] sm:text-5xl">上传 Skill</h1>
      <p className="mt-4 text-[var(--muted-foreground)]">
        该页面将接入 GitHub OAuth。登录后可上传 zip，提交状态默认为 pending。
      </p>

      <form className="mt-8 grid gap-5 rounded-lg border border-[var(--border)] bg-white p-6">
        <label className="grid gap-2">
          <span className="small-caps text-[var(--muted-foreground)]">Skill 名称</span>
          <input
            className="min-h-[44px] rounded-md border border-[var(--border)] px-4 py-2 outline-none transition-all duration-150 focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--ring)]"
            placeholder="例如：MCP Notion Sync"
            type="text"
          />
        </label>

        <label className="grid gap-2">
          <span className="small-caps text-[var(--muted-foreground)]">描述</span>
          <textarea
            className="min-h-36 rounded-md border border-[var(--border)] px-4 py-3 outline-none transition-all duration-150 focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--ring)]"
            placeholder="简要说明 skill 的功能和使用场景"
          />
        </label>

        <label className="grid gap-2">
          <span className="small-caps text-[var(--muted-foreground)]">Zip 压缩包</span>
          <input
            className="min-h-[44px] rounded-md border border-[var(--border)] px-4 py-2 text-sm"
            type="file"
          />
        </label>

        <button
          className="mt-2 min-h-[44px] w-fit rounded-md bg-[var(--accent)] px-6 py-3 text-sm font-medium tracking-[0.05em] text-white transition-all duration-200 hover:bg-[var(--accent-secondary)]"
          type="button"
        >
          提交审核（待接入）
        </button>
      </form>
    </main>
  );
}
