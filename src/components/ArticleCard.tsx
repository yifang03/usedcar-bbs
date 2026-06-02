import Link from "next/link";

interface Article {
  id: number;
  title: string;
  category: string;
  coverImage: string | null;
  createdAt: string;
  user: { nickname: string };
  _count?: { comments?: number; likes?: number };
}

export default function ArticleCard({ article }: { article: Article }) {
  return (
    <Link href={`/articles/${article.id}`} className="card-hover surface mb-3 block overflow-hidden rounded-xl">
      {article.coverImage && (
        <div className="h-40">
          <img src={article.coverImage} alt={article.title} className="h-full w-full object-cover" />
        </div>
      )}
      <div className="p-4">
        <div className="mb-2 flex items-center gap-2">
          {article.category && (
            <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs text-accent">{article.category}</span>
          )}
        </div>
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-text">{article.title}</h3>
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-secondary">
          <span>{article.user.nickname}</span>
          <span>赞 {article._count?.likes ?? 0}</span>
          <span>评 {article._count?.comments ?? 0}</span>
          <span>{new Date(article.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </Link>
  );
}
