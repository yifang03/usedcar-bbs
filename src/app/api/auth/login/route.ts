import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword, signToken } from "@/lib/auth";
import { success, error } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return error("请填写邮箱和密码");
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return error("邮箱或密码错误");
    }

    const valid = await comparePassword(password, user.password);
    if (!valid) {
      return error("邮箱或密码错误");
    }

    const token = signToken({ userId: user.id, role: user.role });

    return success({ token, user: { id: user.id, email: user.email, nickname: user.nickname, role: user.role } });
  } catch {
    return error("登录失败", 500);
  }
}
