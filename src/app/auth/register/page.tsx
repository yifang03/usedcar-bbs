"use client";

import { useState } from "react";
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
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("密码至少6位");
      return;
    }
    setLoading(true);
    const res = await register(email, password, nickname);
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
