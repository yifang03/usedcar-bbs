"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Textarea from "@/components/ui/Textarea";
import { useAuth } from "@/lib/useAuth";

interface Answer {
  id: number;
  content: string;
  isAccepted: boolean;
  createdAt: string;
  user: { id: number; nickname: string; avatar: string | null };
}

interface QuestionDetail {
  id: number;
  title: string;
  description: string;
  tags: string;
  createdAt: string;
  user: { id: number; nickname: string; avatar: string | null };
  answers: Answer[];
  comments: Array<{ id: number; content: string; createdAt: string; user: { nickname: string } }>;
  _count: { answers: number; favorites: number };
}

export default function QuestionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [q, setQ] = useState<QuestionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [answerContent, setAnswerContent] = useState("");
  const [comment, setComment] = useState("");

  useEffect(() => {
    fetch(`/api/questions/${id}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.ok) setQ(res.data);
        else router.push("/questions");
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleAnswer = async () => {
    if (!user) { router.push("/auth/login"); return; }
    if (!answerContent.trim()) return;

    const token = localStorage.getItem("token");
    const res = await fetch("/api/answers", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify({ questionId: parseInt(id), content: answerContent }),
    });
    const json = await res.json();
    if (json.ok) {
      setQ((prev) => prev ? { ...prev, answers: [...prev.answers, json.data], _count: { ...prev._count, answers: prev._count.answers + 1 } } : prev);
      setAnswerContent("");
    }
  };

  const handleAccept = async (answerId: number) => {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/answers", {
      method: "PUT",
      headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify({ id: answerId, isAccepted: true }),
    });
    const json = await res.json();
    if (json.ok) {
      setQ((prev) => prev ? {
        ...prev,
        answers: prev.answers.map((a) => ({ ...a, isAccepted: a.id === answerId })),
      } : prev);
    }
  };

  const handleComment = async () => {
    if (!user) { router.push("/auth/login"); return; }
    if (!comment.trim()) return;

    const token = localStorage.getItem("token");
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify({ targetType: "question", targetId: parseInt(id), content: comment }),
    });
    const json = await res.json();
    if (json.ok) {
      setQ((prev) => prev ? { ...prev, comments: [json.data, ...prev.comments] } : prev);
      setComment("");
    }
  };

  if (loading) return <div className="text-center py-12 text-text-secondary text-sm">加载中...</div>;
  if (!q) return null;

  let tags: string[] = [];
  try { tags = JSON.parse(q.tags); } catch {}

  return (
    <div>
      {/* Question */}
      <div className="bg-card rounded-xl p-4 border border-border mb-4">
        <h1 className="text-lg font-bold mb-2">{q.title}</h1>
        <div className="flex items-center gap-2 text-xs text-text-secondary mb-2">
          <span>{q.user.nickname}</span>
          <span>·</span>
          <span>{new Date(q.createdAt).toLocaleDateString()}</span>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {tags.map((t) => (
              <span key={t} className="px-2 py-0.5 text-xs bg-primary-light text-primary rounded-full">{t}</span>
            ))}
          </div>
        )}
        <p className="text-sm text-text-secondary whitespace-pre-wrap">{q.description}</p>
      </div>

      {/* Answers */}
      <div className="bg-card rounded-xl p-4 border border-border mb-4">
        <h3 className="text-sm font-medium mb-3">回答 ({q.answers.length})</h3>
        <div className="space-y-4">
          {q.answers.map((a) => (
            <div key={a.id} className="pb-4 border-b border-border last:border-0 last:pb-0">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{a.user.nickname}</span>
                  {a.isAccepted && <span className="px-1.5 py-0.5 text-xs bg-secondary/10 text-secondary rounded">已采纳</span>}
                </div>
                <span className="text-xs text-text-secondary">{new Date(a.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-sm whitespace-pre-wrap">{a.content}</p>
              {user && q.user.id === user.id && !a.isAccepted && (
                <button onClick={() => handleAccept(a.id)} className="mt-1 text-xs text-primary">采纳答案</button>
              )}
            </div>
          ))}
          {q.answers.length === 0 && <p className="text-xs text-text-secondary text-center py-4">暂无回答</p>}
        </div>
      </div>

      {/* Answer Form */}
      <div className="bg-card rounded-xl p-4 border border-border mb-4">
        <h3 className="text-sm font-medium mb-3">我来回答</h3>
        <Textarea
          placeholder="输入你的回答..."
          value={answerContent}
          onChange={(e) => setAnswerContent(e.target.value)}
        />
        <Button size="sm" className="mt-2" onClick={handleAnswer}>提交回答</Button>
      </div>

      {/* Comments */}
      <div className="bg-card rounded-xl p-4 border border-border mb-4">
        <h3 className="text-sm font-medium mb-3">评论</h3>
        <div className="flex gap-2 mb-4">
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="发表评论..."
            className="flex-1 h-10 px-3 text-sm bg-white border border-border rounded-lg outline-none focus:border-primary"
          />
          <Button size="sm" onClick={handleComment}>发送</Button>
        </div>
        <div className="space-y-3">
          {q.comments.map((c) => (
            <div key={c.id} className="text-sm">
              <span className="font-medium text-text-secondary">{c.user.nickname}</span>
              <span className="text-text-secondary mx-1">·</span>
              <span className="text-text-secondary text-xs">{new Date(c.createdAt).toLocaleDateString()}</span>
              <p className="mt-0.5">{c.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
