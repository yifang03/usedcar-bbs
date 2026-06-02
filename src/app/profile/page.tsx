"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { useAuth } from "@/lib/useAuth";

interface ProfileData {
  carListings: Array<{ id: number; title: string; status: string; createdAt: string }>;
  questions: Array<{ id: number; title: string; _count: { answers: number }; createdAt: string }>;
  articles: Array<{ id: number; title: string; _count: { comments: number; likes: number }; createdAt: string }>;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const [data, setData] = useState<ProfileData | null>(null);
  const [tab, setTab] = useState<"cars" | "questions" | "articles">("cars");

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/auth/login"); return; }

    const token = localStorage.getItem("token");
    fetch("/api/profile", {
      headers: { authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((res) => { if (res.ok) setData(res.data); });
  }, [user, authLoading, router]);

  if (authLoading || !user) return null;
  if (!data) return <div className="text-center py-12 text-text-secondary text-sm">加载中...</div>;

  const tabs = [
    { key: "cars" as const, label: "我的车源", count: data.carListings.length },
    { key: "questions" as const, label: "我的提问", count: data.questions.length },
    { key: "articles" as const, label: "我的文章", count: data.articles.length },
  ];

  return (
    <div>
      {/* User Info */}
      <div className="surface mb-4 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-light text-lg font-bold text-primary">
            {user.avatar ? <img src={user.avatar} alt="" className="h-full w-full rounded-full object-cover" /> : "我"}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold">{user.nickname}</h2>
            <p className="text-xs text-text-secondary">{user.email}</p>
          </div>
          <button onClick={logout} className="text-xs text-text-secondary hover:text-danger">退出</button>
        </div>
        {user.role === "admin" && (
          <Link href="/admin" className="mt-3 block w-full text-center py-2 text-sm bg-primary-light text-primary rounded-lg">
            进入管理后台
          </Link>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border mb-4">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-2.5 text-sm text-center border-b-2 transition-colors ${
              tab === t.key ? "border-primary text-primary font-medium" : "border-transparent text-text-secondary"
            }`}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === "cars" && (
        <div className="space-y-2">
          {data.carListings.map((c) => (
            <Link key={c.id} href={`/cars/${c.id}`} className="card-hover surface block rounded-xl p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm truncate flex-1">{c.title}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ml-2 ${
                  c.status === "approved" ? "bg-secondary/10 text-secondary" :
                  c.status === "rejected" ? "bg-danger/10 text-danger" : "bg-accent/10 text-accent"
                }`}>
                  {c.status === "approved" ? "已通过" : c.status === "rejected" ? "未通过" : "审核中"}
                </span>
              </div>
              <p className="text-xs text-text-secondary mt-1">{new Date(c.createdAt).toLocaleDateString()}</p>
            </Link>
          ))}
          {data.carListings.length === 0 && <p className="text-center py-8 text-text-secondary text-sm">暂无发布</p>}
        </div>
      )}

      {tab === "questions" && (
        <div className="space-y-2">
          {data.questions.map((q) => (
            <Link key={q.id} href={`/questions/${q.id}`} className="card-hover surface block rounded-xl p-3">
              <span className="text-sm">{q.title}</span>
              <p className="text-xs text-text-secondary mt-1">{q._count.answers} 个回答 · {new Date(q.createdAt).toLocaleDateString()}</p>
            </Link>
          ))}
          {data.questions.length === 0 && <p className="text-center py-8 text-text-secondary text-sm">暂无提问</p>}
        </div>
      )}

      {tab === "articles" && (
        <div className="space-y-2">
          {data.articles.map((a) => (
            <Link key={a.id} href={`/articles/${a.id}`} className="card-hover surface block rounded-xl p-3">
              <span className="text-sm">{a.title}</span>
              <p className="text-xs text-text-secondary mt-1">赞 {a._count.likes} · 评 {a._count.comments} · {new Date(a.createdAt).toLocaleDateString()}</p>
            </Link>
          ))}
          {data.articles.length === 0 && <p className="text-center py-8 text-text-secondary text-sm">暂无文章</p>}
        </div>
      )}
    </div>
  );
}
