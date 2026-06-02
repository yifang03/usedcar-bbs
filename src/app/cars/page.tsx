"use client";

import { Suspense, useEffect, useState } from "react";
import CarCard from "@/components/CarCard";
import LoadingBlock from "@/components/LoadingBlock";
import { useRouter, useSearchParams } from "next/navigation";

const brands = ["大众", "丰田", "本田", "日产", "宝马", "奔驰", "奥迪", "福特", "别克", "现代"];

interface Car {
  id: number;
  title: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  price: number;
  city: string;
  images: string;
  createdAt: string;
}

export default function CarsPage() {
  return <Suspense fallback={<div className="text-center py-12 text-text-secondary text-sm">加载中...</div>}>
    <CarsContent />
  </Suspense>;
}

function CarsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [cars, setCars] = useState<Car[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ brand: "", minPrice: "", maxPrice: "", city: "" });

  const brand = searchParams.get("brand") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const city = searchParams.get("city") || "";

  useEffect(() => {
    setFilters({ brand, minPrice, maxPrice, city });
  }, [brand, minPrice, maxPrice, city]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(page));
    if (brand) params.set("brand", brand);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (city) params.set("city", city);

    fetch(`/api/cars?${params}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((res) => {
        if (res.ok) {
          setCars(res.data.list);
          setTotal(res.data.total);
          setTotalPages(Math.max(res.data.totalPages || 1, 1));
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError") console.error("Load cars failed", err);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [page, brand, minPrice, maxPrice, city]);

  const applyFilters = (e?: React.FormEvent) => {
    e?.preventDefault();
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      const trimmed = value.trim();
      if (trimmed) params.set(key, trimmed);
    });
    params.set("page", "1");
    setPage(1);
    router.push(`/cars?${params}`);
  };

  const clearFilters = () => {
    setFilters({ brand: "", minPrice: "", maxPrice: "", city: "" });
    setPage(1);
    router.push("/cars");
  };

  const goToPage = (nextPage: number) => {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const hasFilters = Boolean(brand || minPrice || maxPrice || city);

  return (
    <div>
      {/* Filters */}
      <form onSubmit={applyFilters} className="surface mb-4 rounded-xl p-3">
        <div className="flex flex-wrap gap-2">
          <select
            value={filters.brand}
            onChange={(e) => setFilters((prev) => ({ ...prev, brand: e.target.value }))}
            className="h-9 rounded-lg border border-border bg-white px-2 text-xs outline-none transition-colors focus:border-primary"
          >
            <option value="">全部品牌</option>
            {brands.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
          <input
            type="number"
            placeholder="最低价"
            value={filters.minPrice}
            onChange={(e) => setFilters((prev) => ({ ...prev, minPrice: e.target.value }))}
            className="h-9 w-20 rounded-lg border border-border bg-white px-2 text-xs outline-none transition-colors focus:border-primary"
          />
          <span className="text-text-secondary text-xs self-center">-</span>
          <input
            type="number"
            placeholder="最高价"
            value={filters.maxPrice}
            onChange={(e) => setFilters((prev) => ({ ...prev, maxPrice: e.target.value }))}
            className="h-9 w-20 rounded-lg border border-border bg-white px-2 text-xs outline-none transition-colors focus:border-primary"
          />
          <input
            type="text"
            placeholder="城市"
            value={filters.city}
            onChange={(e) => setFilters((prev) => ({ ...prev, city: e.target.value }))}
            className="h-9 w-24 rounded-lg border border-border bg-white px-2 text-xs outline-none transition-colors focus:border-primary"
          />
          <button type="submit" className="h-9 rounded-lg bg-primary px-3 text-xs font-medium text-white shadow-sm">
            筛选
          </button>
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="h-9 rounded-lg border border-border bg-white px-3 text-xs text-text-secondary shadow-sm"
            >
              清空
            </button>
          )}
        </div>
      </form>

      {loading && cars.length === 0 ? (
        <LoadingBlock />
      ) : cars.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-secondary text-sm">暂无符合条件的车源</p>
        </div>
      ) : (
        <>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs text-text-secondary">共 {total} 条结果</p>
            {loading && <span className="text-xs text-primary">刷新中...</span>}
          </div>
          {cars.map((car) => <CarCard key={car.id} car={car} />)}

          {/* Pagination */}
          <div className="flex justify-center gap-2 mt-4">
            {page > 1 && (
              <button
                onClick={() => goToPage(page - 1)}
                disabled={loading}
                className="h-9 rounded-lg border border-border bg-white px-4 text-sm shadow-sm transition-colors hover:bg-bg"
              >
                上一页
              </button>
            )}
            <button
              onClick={() => goToPage(page + 1)}
              disabled={loading || page >= totalPages}
              className="h-9 rounded-lg border border-border bg-white px-4 text-sm shadow-sm transition-colors hover:bg-bg disabled:cursor-not-allowed disabled:opacity-50"
            >
              下一页
            </button>
          </div>
        </>
      )}
    </div>
  );
}
