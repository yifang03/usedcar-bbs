"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import { useAuth } from "@/lib/useAuth";

const allTags = ["选车", "卖车", "过户", "保险", "维修", "保养", "验车", "贷款"];

export default function NewQuestionPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) router.push("/auth/login");
  }, [authLoading, user, router]);

  if (authLoading || !user) {
    return <div className="py-12 text-center text-sm text-text-secondary">加载中...</div>;
  }

  const toggleTag = (tag: string) => {
    setTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError("请输入标题"); return; }
    setLoading(true);

    const token = localStorage.getItem("token");
    const res = await fetch("/api/questions", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify({ title, description, tags }),
    });
    const json = await res.json();
    setLoading(false);

    if (json.ok) router.push(`/questions/${json.data.id}`);
    else setError(json.message);
  };

  return (
    <div className="pt-2">
      <h1 className="text-lg font-bold mb-4">提问题</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="标题 *" placeholder="简明扼要描述你的问题" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <Textarea label="问题描述" placeholder="补充说明，让回答者更清楚你的问题..." value={description} onChange={(e) => setDescription(e.target.value)} />

        <div>
          <label className="block text-sm font-medium mb-2 text-text">标签</label>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`chip ${tags.includes(tag) ? "bg-primary text-white" : "border-border bg-white text-text-secondary"}`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}
        <Button type="submit" fullWidth loading={loading}>发布问题</Button>
      </form>
    </div>
  );
}
