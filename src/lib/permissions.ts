import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export type Role =
  | "admin"
  | "vendor"
  | "driver"
  | "customer";

/**
 * Static permission map
 */
export const rolePermissions: Record<
  Role,
  string[]
> = {
  admin: [
    "/admin",
    "/api/admin",
    "/vendor",
    "/driver",
    "/customer",
  ],

  vendor: [
    "/vendor",
    "/api/products",
    "/api/orders",
  ],

  driver: [
    "/driver",
    "/api/orders",
  ],

  customer: [
    "/customer",
    "/api/orders",
    "/api/stores",
  ],
};

export function canAccess(
  pathname: string,
  role: Role
): boolean {
  const allowedPaths =
    rolePermissions[role] || [];

  return allowedPaths.some((path) =>
    pathname.startsWith(path)
  );
}

/**
 * 🔐 Runtime auth guards
 */

export async function requireAuth() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

export async function requireRole(
  roles: Role[]
) {
  const session =
    await requireAuth();

  if (
    !roles.includes(
      session.role as Role
    )
  ) {
    redirect("/");
  }

  return session;
}

export async function requireAdmin() {
  return requireRole(["admin"]);
}

export async function requireVendor() {
  return requireRole(["vendor"]);
}

export async function requireDriver() {
  return requireRole(["driver"]);
}

export async function requireCustomer() {
  return requireRole(["customer"]);
}