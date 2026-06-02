import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { success, error } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user) return error("请先登录", 401);

  const [carListings, questions, articles, favorites] = await Promise.all([
    prisma.carListing.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.question.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { answers: true } } },
    }),
    prisma.article.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.favorite.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  return success({ carListings, questions, articles, favorites });
}
