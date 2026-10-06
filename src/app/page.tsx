import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-24 text-center">
      <h1 className="text-4xl font-bold">TeachMate</h1>
      <p className="mt-4 text-lg text-gray-600">
        Trợ lý AI soạn giáo án và kế hoạch cho giáo viên mầm non.
      </p>
      <Link
        href="/lesson/new"
        className="mt-8 inline-block rounded-lg bg-emerald-600 px-6 py-3 font-medium text-white hover:bg-emerald-700"
      >
        Soạn giáo án mới
      </Link>
    </main>
  );
}
