import Link from "next/link";
import UserMenu from "../user-menu";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden bg-[var(--background)]">
      <header className="relative mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6 sm:px-10">
        <Link className="headline-serif text-2xl text-[var(--foreground)]" href="/">
          Tactus
        </Link>
        <nav className="flex items-center gap-6 text-sm text-[var(--muted-foreground)]">
          <Link className="transition-colors hover:text-[var(--accent)]" href="/skills">
            Skills 广场
          </Link>
          <UserMenu />
        </nav>
      </header>
      {children}
    </div>
  );
}
