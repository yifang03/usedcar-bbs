"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { useAuth } from "@/lib/useAuth";

interface ArticleDetail {
  id: number;
  title: string;
  content: string;
  category: string;
  coverImage: string | null;
  isFeatured: boolean;
  createdAt: string;
  user: { id: number; nickname: string; avatar: string | null };
  comments: Array<{ id: number; content: string; createdAt: string; user: { nickname: string; avatar: string | null } }>;
  _count: { comments: number; favorites: number; likes: number };
}

export default function ArticleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [comment, setComment] = useState("");

  useEffect(() => {
    fetch(`/api/articles/${id}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.ok) setArticle(res.data);
        else router.push("/articles");
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  const toggleLike = async () => {
    if (!user) { router.push("/auth/login"); return; }
    const token = localStorage.getItem("token");
    const res = await fetch("/api/likes", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify({ targetType: "article", targetId: parseInt(id) }),
    });
    const json = await res.json();
    if (json.ok) {
      setLiked(json.data.liked);
      setArticle((prev) => prev ? { ...prev, _count: { ...prev._count, likes: prev._count.likes + (json.data.liked ? 1 : -1) } } : prev);
    }
  };

  const toggleFavorite = async () => {
    if (!user) { router.push("/auth/login"); return; }
    const token = localStorage.getItem("token");
    const res = await fetch("/api/favorites", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify({ targetType: "article", targetId: parseInt(id) }),
    });
    const json = await res.json();
    if (json.ok) setFavorited(json.data.favorited);
  };

  const handleComment = async () => {
    if (!user) { router.push("/auth/login"); return; }
    if (!comment.trim()) return;

    const token = localStorage.getItem("token");
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify({ targetType: "article", targetId: parseInt(id), content: comment }),
    });
    const json = await res.json();
    if (json.ok) {
      setArticle((prev) => prev ? { ...prev, comments: [json.data, ...prev.comments], _count: { ...prev._count, comments: prev._count.comments + 1 } } : prev);
      setComment("");
    }
  };

  if (loading) return <div className="text-center py-12 text-text-secondary text-sm">加载中...</div>;
  if (!article) return null;

  return (
    <div>
      {/* Article Header */}
      <h1 className="text-xl font-bold mb-2">{article.title}</h1>
      <div className="flex items-center gap-2 text-xs text-text-secondary mb-4">
        <span>{article.user.nickname}</span>
        {article.category && <><span>·</span><span className="px-1.5 py-0.5 bg-accent/10 text-accent rounded">{article.category}</span></>}
        <span>·</span>
        <span>{new Date(article.createdAt).toLocaleDateString()}</span>
      </div>

      {article.coverImage && (
        <div className="aspect-video rounded-xl overflow-hidden mb-4">
          <img src={article.coverImage} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Article Content */}
      <div className="bg-card rounded-xl p-4 border border-border mb-4">
        <div className="text-sm leading-relaxed whitespace-pre-wrap">{article.content}</div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={toggleLike} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm ${liked ? "bg-danger/10 text-danger" : "bg-bg text-text-secondary"}`}>
          ❤ {article._count.likes}
        </button>
        <button onClick={toggleFavorite} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm ${favorited ? "bg-accent/10 text-accent" : "bg-bg text-text-secondary"}`}>
          ⭐ {favorited ? "已收藏" : "收藏"}
        </button>
      </div>

      {/* Comments */}
      <div className="bg-card rounded-xl p-4 border border-border mb-4">
        <h3 className="text-sm font-medium mb-3">评论 ({article._count.comments})</h3>
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
          {article.comments.map((c) => (
            <div key={c.id} className="text-sm">
              <span className="font-medium text-text-secondary">{c.user.nickname}</span>
              <span className="text-text-secondary mx-1">·</span>
              <span className="text-text-secondary text-xs">{new Date(c.createdAt).toLocaleDateString()}</span>
              <p className="mt-0.5">{c.content}</p>
            </div>
          ))}
          {article.comments.length === 0 && <p className="text-xs text-text-secondary text-center py-4">暂无评论</p>}
        </div>
      </div>
    </div>
  );
}
