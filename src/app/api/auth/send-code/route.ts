import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email";
import { success, error } from "@/lib/utils";

const EXPIRES_IN_MINUTES = 10;

function createCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const { email, nickname } = await request.json();
    const normalizedEmail = String(email || "").trim().toLowerCase();

    if (!normalizedEmail) return error("请输入邮箱");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) return error("邮箱格式不正确");

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) return error("该邮箱已被注册");

    const recentCode = await prisma.emailVerificationCode.findFirst({
      where: {
        email: normalizedEmail,
        purpose: "register",
        createdAt: { gt: new Date(Date.now() - 60 * 1000) },
      },
      orderBy: { createdAt: "desc" },
    });

    if (recentCode) return error("验证码发送过于频繁，请稍后再试");

    const code = createCode();
    const codeHash = await hashPassword(code);
    const expiresAt = new Date(Date.now() + EXPIRES_IN_MINUTES * 60 * 1000);

    await prisma.emailVerificationCode.create({
      data: {
        email: normalizedEmail,
        codeHash,
        purpose: "register",
        expiresAt,
      },
    });

    await sendVerificationEmail({
      to: normalizedEmail,
      recipientName: nickname || "车友",
      code,
      expiresInMinutes: EXPIRES_IN_MINUTES,
    });

    return success({ expiresInMinutes: EXPIRES_IN_MINUTES });
  } catch (err) {
    console.error("Send verification code failed", err);
    return error("验证码发送失败，请检查邮箱服务配置", 500);
  }
}
