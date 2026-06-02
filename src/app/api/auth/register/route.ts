import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken } from "@/lib/auth";
import { success, error } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const { email, password, nickname } = await request.json();

    if (!email || !password || !nickname) {
      return error("请填写所有必填字段");
    }

    if (password.length < 6) {
      return error("密码至少6位");
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return error("该邮箱已被注册");
    }

    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, nickname },
    });

    const token = signToken({ userId: user.id, role: user.role });

    return success({ token, user: { id: user.id, email: user.email, nickname: user.nickname, role: user.role } });
  } catch {
    return error("注册失败", 500);
  }
}
