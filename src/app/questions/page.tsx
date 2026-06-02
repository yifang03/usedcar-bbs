"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import QuestionCard from "@/components/QuestionCard";
import LoadingBlock from "@/components/LoadingBlock";
import Button from "@/components/ui/Button";

const tags = ["选车", "卖车", "过户", "保险", "维修", "保养", "验车", "贷款"];

interface Question {
  id: number;
  title: string;
  tags: string;
  createdAt: string;
  user: { nickname: string };
  _count: { answers: number };
}

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [tag, setTag] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (tag) params.set("tag", tag);

    fetch(`/api/questions?${params}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((res) => {
        if (res.ok) {
          setQuestions(res.data.list);
          setTotal(res.data.total);
          setTotalPages(Math.max(res.data.totalPages || 1, 1));
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError") console.error("Load questions failed", err);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [page, tag]);

  const changePage = (nextPage: number) => {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-lg font-bold">问答</h1>
        <Link href="/questions/new">
          <Button size="sm">提问题</Button>
        </Link>
      </div>

      {/* Tags */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => { setTag(""); setPage(1); }}
          className={`chip ${!tag ? "bg-primary text-white" : "border-border bg-white text-text-secondary"}`}
        >
          全部
        </button>
        {tags.map((t) => (
          <button
            key={t}
            onClick={() => { setTag(t); setPage(1); }}
            className={`chip ${tag === t ? "bg-primary text-white" : "border-border bg-white text-text-secondary"}`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading && questions.length === 0 ? (
        <LoadingBlock />
      ) : questions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-secondary text-sm">暂无问答</p>
        </div>
      ) : (
        <>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs text-text-secondary">共 {total} 个问题</p>
            {loading && <span className="text-xs text-primary">刷新中...</span>}
          </div>
          {questions.map((q) => <QuestionCard key={q.id} q={q} />)}
          <div className="flex justify-center gap-2 mt-4">
            {page > 1 && <button onClick={() => changePage(page - 1)} disabled={loading} className="h-9 rounded-lg border border-border bg-white px-4 text-sm shadow-sm transition-colors hover:bg-bg disabled:cursor-not-allowed disabled:opacity-50">上一页</button>}
            <button onClick={() => changePage(page + 1)} disabled={loading || page >= totalPages} className="h-9 rounded-lg border border-border bg-white px-4 text-sm shadow-sm transition-colors hover:bg-bg disabled:cursor-not-allowed disabled:opacity-50">下一页</button>
          </div>
        </>
      )}
    </div>
  );
}
