import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { success, error } from "@/lib/utils";

export async function POST(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user) return error("请先登录", 401);

  const { targetType, targetId } = await request.json();
  if (!targetType || !targetId) return error("参数不完整");

  if (!["car", "question", "article"].includes(targetType)) {
    return error("无效的目标类型");
  }

  const existing = await prisma.like.findUnique({
    where: { userId_targetType_targetId: { userId: user.userId, targetType, targetId } },
  });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
    return success({ liked: false });
  } else {
    await prisma.like.create({ data: { userId: user.userId, targetType, targetId } });
    return success({ liked: true });
  }
}
