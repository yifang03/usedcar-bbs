"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import { useAuth } from "@/lib/useAuth";

const categories = ["购车记", "用车心得", "整备案例", "防坑指南"];

export default function NewArticlePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) router.push("/auth/login");
  }, [authLoading, user, router]);

  if (authLoading || !user) {
    return <div className="py-12 text-center text-sm text-text-secondary">加载中...</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) { setError("标题和内容不能为空"); return; }
    setLoading(true);

    const token = localStorage.getItem("token");
    const res = await fetch("/api/articles", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify({ title, content, category }),
    });
    const json = await res.json();
    setLoading(false);

    if (json.ok) router.push(`/articles/${json.data.id}`);
    else setError(json.message);
  };

  return (
    <div className="pt-2">
      <h1 className="text-lg font-bold mb-4">写文章</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="标题 *" placeholder="文章标题" value={title} onChange={(e) => setTitle(e.target.value)} required />

        <div>
          <label className="block text-sm font-medium mb-1 text-text">分类</label>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`chip ${category === c ? "bg-primary text-white" : "border-border bg-white text-text-secondary"}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <Textarea label="正文 *" placeholder="写下你的经验分享..." value={content} onChange={(e) => setContent(e.target.value)} rows={12} required />

        {error && <p className="text-sm text-danger">{error}</p>}
        <Button type="submit" fullWidth loading={loading}>发布文章</Button>
      </form>
    </div>
  );
}
