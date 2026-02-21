import Link from "next/link";
import { auth } from "@/auth";
import { SubmitForm } from "./submit-form";

export default async function SubmitSkillPage() {
  const session = await auth();

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-14 sm:px-10">
      <div className="mb-2 flex items-center gap-4">
        <span className="section-rule" />
        <span className="small-caps whitespace-nowrap text-[var(--accent)]">Submit Skill</span>
        <span className="section-rule" />
      </div>

      <h1 className="headline-serif text-4xl text-[var(--foreground)] sm:text-5xl">上传 Skill</h1>

      {!session?.user?.id ? (
        <section className="mt-8 rounded-lg border border-[var(--border)] bg-white p-6">
          <p className="text-[var(--muted-foreground)]">上传前需要先使用 GitHub 登录。</p>
          <Link
            className="mt-4 inline-flex min-h-[44px] items-center rounded-md bg-[var(--accent)] px-6 py-3 text-sm font-medium tracking-[0.05em] text-white transition-all duration-200 hover:bg-[var(--accent-secondary)]"
            href="/api/auth/signin?callbackUrl=/skills/submit"
          >
            使用 GitHub 登录
          </Link>
        </section>
      ) : (
        <>
          <p className="mt-4 text-[var(--muted-foreground)]">
            当前登录用户：{session.user.name ?? "GitHub User"}。提交后待管理员审核。
          </p>
          <SubmitForm />
          <Link className="small-caps mt-6 inline-block text-[var(--accent)]" href="/api/auth/signout?callbackUrl=/">
            退出登录
          </Link>
        </>
      )}
    </main>
  );
}
