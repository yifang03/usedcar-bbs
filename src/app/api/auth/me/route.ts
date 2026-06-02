import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { success, error } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const payload = getAuthUser(request);
  if (!payload) return error("未登录", 401);

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, nickname: true, avatar: true, role: true, createdAt: true },
  });

  if (!user) return error("用户不存在", 404);

  return success(user);
}
