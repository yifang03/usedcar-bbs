import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { success, error } from "@/lib/utils";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numericId = parseInt(id);

  const article = await prisma.article.findUnique({
    where: { id: numericId },
    include: {
      user: { select: { id: true, nickname: true, avatar: true } },
    },
  });

  if (!article) return error("未找到", 404);

  const [comments, commentsCount, favoritesCount, likesCount] = await Promise.all([
    prisma.comment.findMany({
      where: { targetType: "article", targetId: numericId },
      orderBy: { createdAt: "desc" },
      include: { user: { select: { nickname: true, avatar: true } } },
    }),
    prisma.comment.count({ where: { targetType: "article", targetId: numericId } }),
    prisma.favorite.count({ where: { targetType: "article", targetId: numericId } }),
    prisma.like.count({ where: { targetType: "article", targetId: numericId } }),
  ]);

  return success({ ...article, comments, _count: { comments: commentsCount, favorites: favoritesCount, likes: likesCount } });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getAuthUser(request);
  if (!user) return error("请先登录", 401);

  const { id } = await params;
  const article = await prisma.article.findUnique({ where: { id: parseInt(id) } });
  if (!article) return error("未找到", 404);
  if (article.userId !== user.userId && user.role !== "admin") return error("无权限", 403);

  const body = await request.json();
  const data: Record<string, unknown> = {};
  for (const f of ["title", "content", "category", "coverImage", "isFeatured"]) {
    if (body[f] !== undefined) data[f] = body[f];
  }

  const updated = await prisma.article.update({ where: { id: parseInt(id) }, data });
  return success(updated);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getAuthUser(request);
  if (!user) return error("请先登录", 401);

  const { id } = await params;
  const article = await prisma.article.findUnique({ where: { id: parseInt(id) } });
  if (!article) return error("未找到", 404);
  if (article.userId !== user.userId && user.role !== "admin") return error("无权限", 403);

  await prisma.article.delete({ where: { id: parseInt(id) } });
  return success(null);
}
