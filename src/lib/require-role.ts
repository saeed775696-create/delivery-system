import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/require-role";
export function requireRole(allowedRoles: string[]) {
  return async function guard() {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "غير مصرح" },
        { status: 401 }
      );
    }

    if (!allowedRoles.includes(session.role)) {
      return NextResponse.json(
        { error: "غير مسموح لك" },
        { status: 403 }
      );
    }


export default async function AdminLayout({ children }) {
  await requireRole('admin');

  return <>{children}</>;
}
    return session;
  };
}