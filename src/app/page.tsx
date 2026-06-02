"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CarCard from "@/components/CarCard";
import ArticleCard from "@/components/ArticleCard";
import QuestionCard from "@/components/QuestionCard";
import LoadingBlock from "@/components/LoadingBlock";
import BrandLogo from "@/components/BrandLogo";

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

interface Article {
  id: number;
  title: string;
  category: string;
  coverImage: string | null;
  createdAt: string;
  user: { nickname: string };
  _count: { comments: number; likes: number };
}

interface Question {
  id: number;
  title: string;
  tags: string;
  createdAt: string;
  user: { nickname: string };
  _count: { answers: number };
}

const quickLinks = [
  { href: "/cars", label: "找车源", desc: "按品牌和预算筛选" },
  { href: "/cars/new", label: "发车源", desc: "填写信息等待审核" },
  { href: "/questions", label: "问车友", desc: "选车、验车、防坑" },
];

function SectionHeader({ title, href }: { title: string; href: string }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-base font-bold text-text">{title}</h2>
      <Link href={href} className="text-xs font-medium text-primary">
        查看更多
      </Link>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="surface rounded-xl py-8 text-center">
      <p className="text-sm text-text-secondary">{text}</p>
    </div>
  );
}

export default function HomePage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [featured, setFeatured] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    Promise.all([
      fetch("/api/cars?page=1&limit=5", { signal: controller.signal }).then((r) => r.json()),
      fetch("/api/articles?featured=true&limit=3", { signal: controller.signal }).then((r) => r.json()),
      fetch("/api/articles?page=1&limit=4", { signal: controller.signal }).then((r) => r.json()),
      fetch("/api/questions?page=1&limit=5", { signal: controller.signal }).then((r) => r.json()),
    ]).then(([carsRes, featuredRes, articlesRes, questionsRes]) => {
      if (carsRes.ok) setCars(carsRes.data.list);
      if (featuredRes.ok) setFeatured(featuredRes.data.list);
      if (articlesRes.ok) setArticles(articlesRes.data.list);
      if (questionsRes.ok) setQuestions(questionsRes.data.list);
    }).catch((err) => {
      if (err.name !== "AbortError") console.error("Load home failed", err);
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });

    return () => controller.abort();
  }, []);

  return (
    <div className="space-y-6">
      <section className="surface rounded-2xl p-4">
        <BrandLogo compact />
        <p className="mt-3 text-xs font-medium text-primary">懂车友，少走弯路</p>
        <h1 className="mt-1 text-2xl font-bold leading-tight text-text">买卖二手车，从真实交流开始</h1>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          一方聚合车源、问答和经验分享，帮你更快看懂车况、预算和交易风险。
        </p>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {quickLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-xl border border-border bg-bg/70 px-3 py-3 transition-colors hover:border-primary/30 hover:bg-white"
            >
              <span className="block text-sm font-semibold text-text">{item.label}</span>
              <span className="mt-1 block text-[11px] leading-snug text-text-secondary">{item.desc}</span>
            </Link>
          ))}
        </div>
      </section>

      {featured.length > 0 && (
        <section>
          <SectionHeader title="精选推荐" href="/articles" />
          <div className="scrollbar-hide -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
            {featured.map((a) => (
              <Link
                key={a.id}
                href={`/articles/${a.id}`}
                className="card-hover surface w-64 shrink-0 overflow-hidden rounded-xl"
              >
                {a.coverImage ? (
                  <div className="h-32">
                    <img src={a.coverImage} alt={a.title} className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className="flex h-32 items-center justify-center bg-primary-light text-sm font-medium text-primary">
                    经验分享
                  </div>
                )}
                <div className="p-3">
                  <div className="mb-2 flex items-center gap-2">
                    {a.category && (
                      <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[11px] text-accent">
                        {a.category}
                      </span>
                    )}
                    <span className="text-[11px] text-text-secondary">{a.user.nickname}</span>
                  </div>
                  <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-text">{a.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <SectionHeader title="最新车源" href="/cars" />
        {loading && cars.length === 0 ? (
          <LoadingBlock />
        ) : cars.length > 0 ? (
          cars.map((car) => <CarCard key={car.id} car={car} />)
        ) : (
          <EmptyState text="暂无车源信息" />
        )}
      </section>

      <section>
        <SectionHeader title="最新问答" href="/questions" />
        {loading && questions.length === 0 ? (
          <LoadingBlock />
        ) : questions.length > 0 ? (
          questions.map((q) => <QuestionCard key={q.id} q={q} />)
        ) : (
          <EmptyState text="暂无问答" />
        )}
      </section>

      <section>
        <SectionHeader title="最新经验分享" href="/articles" />
        {loading && articles.length === 0 ? (
          <LoadingBlock />
        ) : articles.length > 0 ? (
          articles.map((a) => <ArticleCard key={a.id} article={a} />)
        ) : (
          <EmptyState text="暂无文章" />
        )}
      </section>
    </div>
  );
}
