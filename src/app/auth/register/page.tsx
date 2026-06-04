"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useAuth } from "@/lib/useAuth";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = window.setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [countdown]);

  const handleSendCode = async () => {
    setError("");
    if (!email.trim()) {
      setError("请先填写邮箱");
      return;
    }

    setSendingCode(true);
    const res = await fetch("/api/auth/send-code", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, nickname }),
    });
    const json = await res.json();
    setSendingCode(false);

    if (json.ok) {
      setCountdown(60);
    } else {
      setError(json.message || "验证码发送失败");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("密码至少6位");
      return;
    }
    if (!verificationCode.trim()) {
      setError("请输入邮箱验证码");
      return;
    }
    setLoading(true);
    const res = await register(email, password, nickname, verificationCode);
    setLoading(false);

    if (res.ok) {
      router.push("/profile");
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="pt-8">
      <h1 className="text-xl font-bold text-center mb-8">注册</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="昵称"
          placeholder="请输入昵称"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          required
        />
        <Input
          label="邮箱"
          type="email"
          placeholder="请输入邮箱"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <div>
          <label className="block text-sm font-medium mb-1 text-text">邮箱验证码</label>
          <div className="flex gap-2">
            <Input
              placeholder="6位验证码"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric"
              maxLength={6}
              required
            />
            <Button
              type="button"
              variant="outline"
              className="shrink-0"
              disabled={sendingCode || countdown > 0}
              loading={sendingCode}
              onClick={handleSendCode}
            >
              {countdown > 0 ? `${countdown}s` : "发送验证码"}
            </Button>
          </div>
        </div>
        <Input
          label="密码"
          type="password"
          placeholder="至少6位"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button type="submit" fullWidth loading={loading}>
          注册
        </Button>
      </form>
      <p className="mt-4 text-sm text-center text-text-secondary">
        已有账号？
        <Link href="/auth/login" className="text-primary ml-1">去登录</Link>
      </p>
    </div>
  );
}
