"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { useAuth } from "@/lib/useAuth";

interface CarDetail {
  id: number;
  title: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  price: number;
  city: string;
  description: string;
  images: string;
  status: string;
  createdAt: string;
  user: { id: number; nickname: string; avatar: string | null };
  comments: Array<{ id: number; content: string; createdAt: string; user: { nickname: string; avatar: string | null } }>;
  _count: { comments: number; favorites: number; likes: number };
}

export default function CarDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [car, setCar] = useState<CarDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [currentImg, setCurrentImg] = useState(0);

  useEffect(() => {
    fetch(`/api/cars/${id}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.ok) setCar(res.data);
        else router.push("/cars");
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleComment = async () => {
    if (!user) { router.push("/auth/login"); return; }
    if (!comment.trim()) return;

    const token = localStorage.getItem("token");
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify({ targetType: "car", targetId: parseInt(id), content: comment }),
    });
    const json = await res.json();
    if (json.ok) {
      setCar((prev) => prev ? { ...prev, comments: [json.data, ...prev.comments], _count: { ...prev._count, comments: prev._count.comments + 1 } } : prev);
      setComment("");
    }
  };

  if (loading) return <div className="text-center py-12 text-text-secondary text-sm">加载中...</div>;
  if (!car) return null;

  let images: string[] = [];
  try { images = JSON.parse(car.images); } catch {}

  return (
    <div>
      {/* Image Carousel */}
      {images.length > 0 && (
        <div className="relative -mx-4 mb-4">
          <div className="aspect-[4/3] bg-bg">
            <img src={images[currentImg]} alt="" className="w-full h-full object-cover" />
          </div>
          {images.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentImg(i)}
                  className={`w-2 h-2 rounded-full ${i === currentImg ? "bg-white" : "bg-white/50"}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Info */}
      <h1 className="text-lg font-bold mb-1">{car.title}</h1>
      <p className="text-2xl font-bold text-danger mb-3">¥{car.price.toLocaleString()}</p>

      <div className="grid grid-cols-2 gap-3 bg-card rounded-xl p-4 border border-border mb-4">
        <div><span className="text-xs text-text-secondary">品牌</span><p className="text-sm">{car.brand}</p></div>
        <div><span className="text-xs text-text-secondary">车系</span><p className="text-sm">{car.model}</p></div>
        <div><span className="text-xs text-text-secondary">年份</span><p className="text-sm">{car.year}年</p></div>
        <div><span className="text-xs text-text-secondary">里程</span><p className="text-sm">{car.mileage}万公里</p></div>
        <div><span className="text-xs text-text-secondary">城市</span><p className="text-sm">{car.city}</p></div>
        <div><span className="text-xs text-text-secondary">发布时间</span><p className="text-sm">{new Date(car.createdAt).toLocaleDateString()}</p></div>
      </div>

      {/* Description */}
      {car.description && (
        <div className="bg-card rounded-xl p-4 border border-border mb-4">
          <h3 className="text-sm font-medium mb-2">车辆描述</h3>
          <p className="text-sm text-text-secondary whitespace-pre-wrap">{car.description}</p>
        </div>
      )}

      {/* Owner info */}
      <div className="bg-card rounded-xl p-4 border border-border mb-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary-light rounded-full flex items-center justify-center text-lg">
          {car.user.avatar ? <img src={car.user.avatar} alt="" className="w-full h-full rounded-full object-cover" /> : "👤"}
        </div>
        <div>
          <p className="text-sm font-medium">{car.user.nickname}</p>
          <p className="text-xs text-text-secondary">车主</p>
        </div>
      </div>

      {/* Comments */}
      <div className="bg-card rounded-xl p-4 border border-border mb-4">
        <h3 className="text-sm font-medium mb-3">评论 ({car._count.comments})</h3>
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
          {car.comments.map((c) => (
            <div key={c.id} className="text-sm">
              <span className="font-medium text-text-secondary">{c.user.nickname}</span>
              <span className="text-text-secondary mx-1">·</span>
              <span className="text-text-secondary text-xs">{new Date(c.createdAt).toLocaleDateString()}</span>
              <p className="mt-0.5">{c.content}</p>
            </div>
          ))}
          {car.comments.length === 0 && <p className="text-xs text-text-secondary text-center py-4">暂无评论</p>}
        </div>
      </div>
    </div>
  );
}
