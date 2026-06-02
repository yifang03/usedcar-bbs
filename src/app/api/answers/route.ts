import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { success, error } from "@/lib/utils";

export async function POST(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user) return error("请先登录", 401);

  const { questionId, content } = await request.json();
  if (!questionId || !content) return error("参数不完整");

  const answer = await prisma.answer.create({
    data: { questionId, userId: user.userId, content },
    include: { user: { select: { id: true, nickname: true, avatar: true } } },
  });

  return success(answer);
}

export async function PUT(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user) return error("请先登录", 401);

  const { id, isAccepted } = await request.json();
  const answer = await prisma.answer.findUnique({
    where: { id },
    include: { question: true },
  });

  if (!answer) return error("未找到", 404);
  if (answer.question.userId !== user.userId && user.role !== "admin") return error("无权限", 403);

  if (isAccepted) {
    // Unaccept all other answers on this question first
    await prisma.answer.updateMany({
      where: { questionId: answer.questionId },
      data: { isAccepted: false },
    });
  }

  const updated = await prisma.answer.update({
    where: { id },
    data: { isAccepted },
  });

  return success(updated);
}
