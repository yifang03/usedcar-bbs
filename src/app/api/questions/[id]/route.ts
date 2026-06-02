import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { success, error } from "@/lib/utils";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numericId = parseInt(id);

  const question = await prisma.question.findUnique({
    where: { id: numericId },
    include: {
      user: { select: { id: true, nickname: true, avatar: true } },
      answers: {
        orderBy: [ { isAccepted: "desc" }, { createdAt: "desc" } ],
        include: { user: { select: { id: true, nickname: true, avatar: true } } },
      },
    },
  });

  if (!question) return error("未找到", 404);

  const [comments, commentsCount, favoritesCount] = await Promise.all([
    prisma.comment.findMany({
      where: { targetType: "question", targetId: numericId },
      orderBy: { createdAt: "desc" },
      include: { user: { select: { nickname: true } } },
    }),
    prisma.comment.count({ where: { targetType: "question", targetId: numericId } }),
    prisma.favorite.count({ where: { targetType: "question", targetId: numericId } }),
  ]);

  return success({ ...question, comments, _count: { answers: question.answers.length, favorites: favoritesCount } });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getAuthUser(request);
  if (!user) return error("请先登录", 401);

  const { id } = await params;
  const question = await prisma.question.findUnique({ where: { id: parseInt(id) } });
  if (!question) return error("未找到", 404);
  if (question.userId !== user.userId && user.role !== "admin") return error("无权限", 403);

  await prisma.question.delete({ where: { id: parseInt(id) } });
  return success(null);
}
