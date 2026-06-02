"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import CarCard from "@/components/CarCard";
import QuestionCard from "@/components/QuestionCard";
import ArticleCard from "@/components/ArticleCard";

export default function SearchPage() {
  return <Suspense fallback={<div className="text-center py-12 text-text-secondary text-sm">加载中...</div>}>
    <SearchContent />
  </Suspense>;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const [results, setResults] = useState<Record<string, unknown[]>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q.trim()) return;
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((res) => { if (res.ok) setResults(res.data); })
      .finally(() => setLoading(false));
  }, [q]);

  return (
    <div>
      <h1 className="text-lg font-bold mb-4">搜索结果：{q}</h1>

      {loading ? (
        <div className="text-center py-12 text-text-secondary text-sm">搜索中...</div>
      ) : (
        <>
          {results.cars && results.cars.length > 0 && (
            <section className="mb-6">
              <h2 className="text-sm font-medium mb-2">车源 ({results.cars.length})</h2>
              {(results.cars as unknown[]).map((car: unknown) => <CarCard key={(car as Record<string, number>).id} car={car as Parameters<typeof CarCard>[0]["car"]} />)}
            </section>
          )}

          {results.questions && results.questions.length > 0 && (
            <section className="mb-6">
              <h2 className="text-sm font-medium mb-2">问答 ({results.questions.length})</h2>
              {(results.questions as unknown[]).map((q: unknown) => <QuestionCard key={(q as Record<string, number>).id} q={q as Parameters<typeof QuestionCard>[0]["q"]} />)}
            </section>
          )}

          {results.articles && results.articles.length > 0 && (
            <section className="mb-6">
              <h2 className="text-sm font-medium mb-2">文章 ({results.articles.length})</h2>
              {(results.articles as unknown[]).map((a: unknown) => <ArticleCard key={(a as Record<string, number>).id} article={a as Parameters<typeof ArticleCard>[0]["article"]} />)}
            </section>
          )}

          {!results.cars?.length && !results.questions?.length && !results.articles?.length && (
            <div className="text-center py-12">
              <p className="text-text-secondary text-sm">未找到相关结果</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
