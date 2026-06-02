"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import BrandLogo from "@/components/BrandLogo";

export default function Header() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-white/90 backdrop-blur">
      <div className="max-w-lg mx-auto px-4 py-3">
        <div className="flex items-center gap-2.5">
          <Link href="/" className="min-w-0 shrink">
            <BrandLogo />
          </Link>
          <form onSubmit={handleSearch} className="relative min-w-[9.5rem] flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-secondary">
              搜
            </span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜车源、问题、文章"
              className="w-full h-10 rounded-full border border-border bg-bg/80 pl-8 pr-3 text-sm outline-none transition-colors focus:border-primary focus:bg-white"
            />
          </form>
        </div>
      </div>
    </header>
  );
}
