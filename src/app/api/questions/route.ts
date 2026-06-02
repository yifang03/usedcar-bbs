import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { success, error } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tag = searchParams.get("tag");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 20;

  const where: Record<string, unknown> = {};
  if (tag) where.tags = { contains: tag };

  const [questions, total] = await Promise.all([
    prisma.question.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: { select: { nickname: true } },
        _count: { select: { answers: true } },
      },
    }),
    prisma.question.count({ where }),
  ]);

  return success({ list: questions, total, page, totalPages: Math.ceil(total / limit) });
}

export async function POST(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user) return error("请先登录", 401);

  try {
    const { title, description, tags } = await request.json();
    if (!title) return error("请输入标题");

    const question = await prisma.question.create({
      data: {
        userId: user.userId,
        title,
        description: description || "",
        tags: JSON.stringify(tags || []),
      },
    });

    return success(question);
  } catch {
    return error("发布失败", 500);
  }
}
