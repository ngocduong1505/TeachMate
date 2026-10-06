import type { Metadata } from "next";
import { Baloo_2, Nunito } from "next/font/google";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import "./globals.css";

const nunito = Nunito({ variable: "--font-nunito", subsets: ["latin", "vietnamese"] });
const baloo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin", "vietnamese"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: "TeachMate – Trợ lý soạn giáo án mầm non",
  description: "Soạn giáo án và kế hoạch giáo dục mầm non nhanh chóng với trợ lý AI.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body className={`${nunito.variable} ${baloo.variable} flex min-h-screen flex-col antialiased`}>
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
