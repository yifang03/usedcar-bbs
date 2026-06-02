"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ArticleCard from "@/components/ArticleCard";
import LoadingBlock from "@/components/LoadingBlock";
import Button from "@/components/ui/Button";

const categories = ["购车记", "用车心得", "整备案例", "防坑指南"];

interface Article {
  id: number;
  title: string;
  category: string;
  coverImage: string | null;
  createdAt: string;
  user: { nickname: string };
  _count: { comments: number; likes: number };
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (category) params.set("category", category);

    fetch(`/api/articles?${params}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((res) => {
        if (res.ok) {
          setArticles(res.data.list);
          setTotal(res.data.total);
          setTotalPages(Math.max(res.data.totalPages || 1, 1));
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError") console.error("Load articles failed", err);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [page, category]);

  const changePage = (nextPage: number) => {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-lg font-bold">经验分享</h1>
        <Link href="/articles/new">
          <Button size="sm">写文章</Button>
        </Link>
      </div>

      {/* Categories */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => { setCategory(""); setPage(1); }}
          className={`chip ${!category ? "bg-primary text-white" : "border-border bg-white text-text-secondary"}`}
        >
          全部
        </button>
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => { setCategory(c); setPage(1); }}
            className={`chip ${category === c ? "bg-primary text-white" : "border-border bg-white text-text-secondary"}`}
          >
            {c}
          </button>
        ))}
      </div>

      {loading && articles.length === 0 ? (
        <LoadingBlock />
      ) : articles.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-secondary text-sm">暂无文章</p>
        </div>
      ) : (
        <>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs text-text-secondary">共 {total} 篇文章</p>
            {loading && <span className="text-xs text-primary">刷新中...</span>}
          </div>
          {articles.map((a) => <ArticleCard key={a.id} article={a} />)}
          <div className="flex justify-center gap-2 mt-4">
            {page > 1 && <button onClick={() => changePage(page - 1)} disabled={loading} className="h-9 rounded-lg border border-border bg-white px-4 text-sm shadow-sm transition-colors hover:bg-bg disabled:cursor-not-allowed disabled:opacity-50">上一页</button>}
            <button onClick={() => changePage(page + 1)} disabled={loading || page >= totalPages} className="h-9 rounded-lg border border-border bg-white px-4 text-sm shadow-sm transition-colors hover:bg-bg disabled:cursor-not-allowed disabled:opacity-50">下一页</button>
          </div>
        </>
      )}
    </div>
  );
}
