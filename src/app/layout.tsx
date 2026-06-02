import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "一方二手车论坛 - 懂车友，少走弯路",
  description: "一方二手车论坛，二手车买卖、问答和经验分享社区。",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <Header />
        <main className="max-w-lg mx-auto px-4 pb-24 pt-4 min-h-screen">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
