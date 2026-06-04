import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword, hashPassword, signToken } from "@/lib/auth";
import { success, error } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const { email, password, nickname, verificationCode } = await request.json();
    const normalizedEmail = String(email || "").trim().toLowerCase();

    if (!normalizedEmail || !password || !nickname || !verificationCode) {
      return error("请填写所有必填字段");
    }

    if (password.length < 6) {
      return error("密码至少6位");
    }

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return error("该邮箱已被注册");
    }

    const codeRecord = await prisma.emailVerificationCode.findFirst({
      where: {
        email: normalizedEmail,
        purpose: "register",
        usedAt: null,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!codeRecord) return error("请先获取邮箱验证码");
    if (codeRecord.expiresAt.getTime() < Date.now()) return error("验证码已过期，请重新获取");

    const codeValid = await comparePassword(String(verificationCode).trim(), codeRecord.codeHash);
    if (!codeValid) return error("验证码不正确");

    const hashedPassword = await hashPassword(password);
    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: { email: normalizedEmail, password: hashedPassword, nickname },
      });

      await tx.emailVerificationCode.update({
        where: { id: codeRecord.id },
        data: { usedAt: new Date() },
      });

      return created;
    });

    const token = signToken({ userId: user.id, role: user.role });

    return success({ token, user: { id: user.id, email: user.email, nickname: user.nickname, role: user.role } });
  } catch {
    return error("注册失败", 500);
  }
}
