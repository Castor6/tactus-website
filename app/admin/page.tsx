import { auth } from "@/auth";
import Link from "next/link";
import { AdminReviewPanel } from "./admin-review-panel";

export default async function AdminPage() {
  const session = await auth();

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-14 sm:px-10">
      <div className="mb-2 flex items-center gap-4">
        <span className="section-rule" />
        <span className="small-caps whitespace-nowrap text-[var(--accent)]">Admin</span>
        <span className="section-rule" />
      </div>

      <h1 className="headline-serif text-4xl text-[var(--foreground)] sm:text-5xl">审核后台</h1>

      {!session?.user?.id ? (
        <section className="mt-8 rounded-lg border border-[var(--border)] bg-white p-6">
          <p className="text-[var(--muted-foreground)]">访问审核后台前，请先使用 GitHub 登录。</p>
          <Link
            className="mt-4 inline-flex min-h-[44px] items-center rounded-md bg-[var(--accent)] px-6 py-3 text-sm font-medium tracking-[0.05em] text-white transition-all duration-200 hover:bg-[var(--accent-secondary)]"
            href="/api/auth/signin?callbackUrl=/admin"
          >
            使用 GitHub 登录
          </Link>
        </section>
      ) : !session.user.isAdmin ? (
        <section className="mt-8 rounded-lg border border-[var(--border)] bg-white p-6">
          <p className="text-[var(--muted-foreground)]">当前账号没有管理员权限。请在环境变量 `ADMIN_GITHUB_IDS` 中配置你的 GitHub ID。</p>
        </section>
      ) : (
        <>
          <p className="mt-4 text-[var(--muted-foreground)]">当前管理员：{session.user.name ?? "GitHub Admin"}</p>
          <AdminReviewPanel />
        </>
      )}
    </main>
  );
}
