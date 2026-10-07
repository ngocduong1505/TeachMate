import Link from "next/link";
import { AuthNav } from "@/components/AuthNav";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <span className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-amber-300 to-orange-400 text-xl shadow-md shadow-orange-200 -rotate-6">
        🍎
      </span>
      <span className="font-display text-2xl font-extrabold tracking-tight text-ink">
        Teach<span className="text-teal-600">Mate</span>
      </span>
    </Link>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-amber-100 bg-cream/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1760px] items-center justify-between px-5 sm:px-8 2xl:px-12">
        <Logo />
        <nav className="flex items-center gap-2">
          <Link href="/library" className="rounded-full px-4 py-2 text-sm font-bold text-stone-600 transition hover:bg-amber-100">
            📚 Thư viện
          </Link>
          <AuthNav />
          <Link
            href="/lesson/new"
            className="rounded-full bg-teal-600 px-5 py-2 text-sm font-bold text-white shadow-md shadow-teal-200 transition hover:-translate-y-0.5 hover:bg-teal-700"
          >
            ✨ Soạn giáo án
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-amber-100 py-6 text-center text-sm text-stone-500">
      TeachMate · Trợ lý AI cho giáo viên mầm non · Nội dung do AI tạo là bản nháp, cô vui lòng kiểm tra lại.
    </footer>
  );
}
