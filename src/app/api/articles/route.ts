import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { success, error } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const featured = searchParams.get("featured");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 20;

  const where: Record<string, unknown> = {};
  if (category) where.category = category;
  if (featured === "true") where.isFeatured = true;

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: { select: { nickname: true } },
      },
    }),
    prisma.article.count({ where }),
  ]);

  return success({ list: articles, total, page, totalPages: Math.ceil(total / limit) });
}

export async function POST(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user) return error("请先登录", 401);

  try {
    const { title, content, category, coverImage } = await request.json();
    if (!title || !content) return error("标题和内容不能为空");

    const article = await prisma.article.create({
      data: {
        userId: user.userId,
        title,
        content,
        category: category || "",
        coverImage: coverImage || null,
      },
    });

    return success(article);
  } catch {
    return error("发布失败", 500);
  }
}
