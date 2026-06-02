import { NextResponse } from "next/server";

export function success(data: unknown, status = 200) {
  return NextResponse.json({ ok: true, data }, { status });
}

export function error(message: string, status = 400) {
  return NextResponse.json({ ok: false, message }, { status });
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w一-龥]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function parseJsonField<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}
