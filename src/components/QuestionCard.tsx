import Link from "next/link";

interface Question {
  id: number;
  title: string;
  tags: string;
  createdAt: string;
  user: { nickname: string };
  _count: { answers: number };
}

export default function QuestionCard({ q }: { q: Question }) {
  let tags: string[] = [];
  try { tags = JSON.parse(q.tags); } catch {}

  return (
    <Link href={`/questions/${q.id}`} className="card-hover surface mb-3 block rounded-xl p-4">
      <div className="flex gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-light text-sm font-bold text-primary">
          问
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-text">{q.title}</h3>
          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-text-secondary">
            <span>{q.user.nickname}</span>
            <span>·</span>
            <span>{q._count.answers} 个回答</span>
            <span>·</span>
            <span>{new Date(q.createdAt).toLocaleDateString()}</span>
          </div>
          {tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span key={tag} className="rounded-full bg-primary-light px-2 py-0.5 text-xs text-primary">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
