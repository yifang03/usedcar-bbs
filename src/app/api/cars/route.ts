import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { success, error } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const brand = searchParams.get("brand");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const city = searchParams.get("city");
  const status = searchParams.get("status") || "approved";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 20;

  const where: Record<string, unknown> = { status };

  if (brand) where.brand = brand;
  if (city) where.city = { contains: city };
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) (where.price as Record<string, number>).gte = parseInt(minPrice);
    if (maxPrice) (where.price as Record<string, number>).lte = parseInt(maxPrice);
  }

  const [listings, total] = await Promise.all([
    prisma.carListing.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { },
    }),
    prisma.carListing.count({ where }),
  ]);

  return success({ list: listings, total, page, totalPages: Math.ceil(total / limit) });
}

export async function POST(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user) return error("请先登录", 401);

  try {
    const body = await request.json();
    const { title, brand, model, year, mileage, price, city, description, images } = body;

    if (!title || !brand || !model || !year || !mileage || !price || !city) {
      return error("请填写所有必填字段");
    }

    const listing = await prisma.carListing.create({
      data: {
        userId: user.userId,
        title,
        brand,
        model,
        year: parseInt(year),
        mileage: parseInt(mileage),
        price: parseFloat(price),
        city,
        description: description || "",
        images: JSON.stringify(images || []),
        status: "pending",
      },
    });

    return success(listing);
  } catch {
    return error("发布失败", 500);
  }
}
