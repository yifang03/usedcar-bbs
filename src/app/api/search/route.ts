import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  const type = searchParams.get("type"); // all | car | question | article

  if (!q || !q.trim()) {
    return success({ cars: [], questions: [], articles: [] });
  }

  const keyword = q.trim();

  const results: Record<string, unknown[]> = {};

  if (!type || type === "all" || type === "car") {
    results.cars = await prisma.carListing.findMany({
      where: {
        status: "approved",
        OR: [
          { title: { contains: keyword } },
          { brand: { contains: keyword } },
          { model: { contains: keyword } },
          { city: { contains: keyword } },
          { description: { contains: keyword } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
  }

  if (!type || type === "all" || type === "question") {
    results.questions = await prisma.question.findMany({
      where: {
        OR: [
          { title: { contains: keyword } },
          { description: { contains: keyword } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        user: { select: { nickname: true } },
        _count: { select: { answers: true } },
      },
    });
  }

  if (!type || type === "all" || type === "article") {
    results.articles = await prisma.article.findMany({
      where: {
        OR: [
          { title: { contains: keyword } },
          { content: { contains: keyword } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        user: { select: { nickname: true } },
      },
    });
  }

  return success(results);
}
