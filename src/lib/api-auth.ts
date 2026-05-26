import { getSession } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function requireApiAuth(request: NextRequest) {
  const session = await getSession();

  if (!session) {
    return {
      ok: false,
      response: new Response(
        JSON.stringify({ error: "غير مصرح" }),
        { status: 401 }
      ),
      session: null,
    };
  }

  return {
    ok: true,
    session,
    response: null,
  };
}