import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export function requireRole(allowedRoles: string[]) {
  return async function guard() {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    if (!allowedRoles.includes(session.role)) {
      return NextResponse.json({ error: "غير مسموح لك" }, { status: 403 });
    }

    return session;
  };
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const guard = requireRole(["admin"]);
  await guard();

  return children;
}