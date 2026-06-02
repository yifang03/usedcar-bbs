import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { success, error } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const targetType = searchParams.get("targetType");
  const targetId = searchParams.get("targetId");

  if (!targetType || !targetId) return error("参数不完整");

  const comments = await prisma.comment.findMany({
    where: { targetType, targetId: parseInt(targetId) },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { nickname: true, avatar: true } } },
  });

  return success(comments);
}

export async function POST(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user) return error("请先登录", 401);

  const { targetType, targetId, content } = await request.json();
  if (!targetType || !targetId || !content) return error("参数不完整");

  // Validate target type
  if (!["car", "question", "article"].includes(targetType)) {
    return error("无效的评论目标类型");
  }

  const comment = await prisma.comment.create({
    data: { targetType, targetId, userId: user.userId, content },
    include: { user: { select: { nickname: true, avatar: true } } },
  });

  return success(comment);
}
