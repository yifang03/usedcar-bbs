"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "首页", icon: "⌂" },
  { href: "/cars", label: "车源", icon: "车" },
  { href: "/cars/new", label: "发布", icon: "+" },
  { href: "/questions", label: "问答", icon: "问" },
  { href: "/profile", label: "我的", icon: "人" },
];

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/80 bg-white/95 pb-safe backdrop-blur">
      <div className="grid h-16 max-w-lg grid-cols-5 items-center gap-1 px-3 mx-auto">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex h-12 flex-col items-center justify-center rounded-xl transition-colors ${
                active ? "bg-primary-light text-primary" : "text-text-secondary hover:bg-bg"
              }`}
            >
              <span
                className={`mb-0.5 flex h-5 min-w-5 items-center justify-center text-sm font-semibold leading-none ${
                  item.href === "/cars/new" ? "text-lg" : ""
                }`}
              >
                {item.icon}
              </span>
              <span className="text-[10px] leading-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
