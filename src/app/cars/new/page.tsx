"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import ImageUploader from "@/components/ImageUploader";
import { useAuth } from "@/lib/useAuth";

const brands = ["大众", "丰田", "本田", "日产", "宝马", "奔驰", "奥迪", "福特", "别克", "现代"];

export default function NewCarPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [form, setForm] = useState({
    title: "", brand: "", model: "", year: "", mileage: "", price: "", city: "", description: "",
  });
  const [images, setImages] = useState<string[]>([]);
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
    setError("");

    if (!form.title || !form.brand || !form.model || !form.year || !form.mileage || !form.price || !form.city) {
      setError("请填写所有必填字段");
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("token");
    const res = await fetch("/api/cars", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...form, images }),
    });
    const json = await res.json();
    setLoading(false);

    if (json.ok) {
      router.push(`/cars/${json.data.id}`);
    } else {
      setError(json.message);
    }
  };

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="pt-2">
      <h1 className="text-lg font-bold mb-4">发布车源</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="标题 *" placeholder="如：15年高尔夫1.4T自动舒适" value={form.title} onChange={(e) => update("title", e.target.value)} required />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1 text-text">品牌 *</label>
            <select
              value={form.brand}
              onChange={(e) => update("brand", e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm shadow-sm outline-none transition-colors focus:border-primary"
              required
            >
              <option value="">选择品牌</option>
              {brands.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <Input label="车系 *" placeholder="如：高尔夫" value={form.model} onChange={(e) => update("model", e.target.value)} required />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input label="年份 *" type="number" placeholder="如：2015" value={form.year} onChange={(e) => update("year", e.target.value)} required />
          <Input label="里程(万公里) *" type="number" placeholder="如：8" value={form.mileage} onChange={(e) => update("mileage", e.target.value)} required />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input label="价格(万) *" type="number" placeholder="如：5.8" value={form.price} onChange={(e) => update("price", e.target.value)} required />
          <Input label="城市 *" placeholder="如：北京" value={form.city} onChange={(e) => update("city", e.target.value)} required />
        </div>

        <Textarea label="车辆描述" placeholder="车况、配置、改装等信息..." value={form.description} onChange={(e) => update("description", e.target.value)} />

        <div>
          <label className="block text-sm font-medium mb-1 text-text">图片（最多9张）</label>
          <ImageUploader images={images} onChange={setImages} />
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

        <Button type="submit" fullWidth loading={loading}>
          提交审核
        </Button>
        <p className="text-xs text-text-secondary text-center">发布后需管理员审核通过才会展示</p>
      </form>
    </div>
  );
}
