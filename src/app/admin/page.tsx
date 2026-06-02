"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { useAuth } from "@/lib/useAuth";

interface PendingItem {
  id: number;
  title: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  city: string;
  status: string;
  createdAt: string;
  user: { nickname: string; email: string };
}

export default function AdminPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [pending, setPending] = useState<PendingItem[]>([]);
  const [listLoading, setListLoading] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== "admin") {
      router.push("/");
      return;
    }

    fetch("/api/cars?status=pending")
      .then((r) => r.json())
      .then((res) => {
        if (res.ok) setPending(res.data.list);
      })
      .finally(() => setListLoading(false));
  }, [user, loading, router]);

  const handleAction = async (id: number, status: string) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/cars/${id}`, {
      method: "PUT",
      headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
    const json = await res.json();
    if (json.ok) {
      setPending((prev) => prev.filter((item) => item.id !== id));
    }
  };

  if (loading || !user) return null;

  return (
    <div>
      <h1 className="text-lg font-bold mb-4">管理后台 - 车源审核</h1>

      {listLoading ? (
        <div className="text-center py-12 text-text-secondary text-sm">加载中...</div>
      ) : pending.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-secondary text-sm">暂无待审核车源</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pending.map((item) => (
            <div key={item.id} className="bg-card rounded-xl p-4 border border-border">
              <h3 className="text-sm font-medium">{item.title}</h3>
              <div className="mt-1 text-xs text-text-secondary space-y-0.5">
                <p>{item.brand} {item.model} · {item.year}年 · {item.city} · ¥{item.price.toLocaleString()}</p>
                <p>发布者：{item.user.nickname} ({item.user.email})</p>
                <p>{new Date(item.createdAt).toLocaleString()}</p>
              </div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="primary" onClick={() => handleAction(item.id, "approved")}>
                  通过
                </Button>
                <Button size="sm" variant="danger" onClick={() => handleAction(item.id, "rejected")}>
                  拒绝
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
