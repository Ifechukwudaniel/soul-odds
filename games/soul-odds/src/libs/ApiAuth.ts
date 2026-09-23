import { NextResponse } from "next/server";
import { Env } from "@/libs/Env";

/**
 * Gates an API route behind `NEXT_PUBLIC_API_SECRET`, checked against the `x-api-secret` header.
 * Returns a 401 response to short-circuit the route, or `null` when the request is allowed
 * through. When the secret isn't configured, every request is allowed (matches the rest of this
 * codebase's pattern of optional env-gated features).
 */
export function requireApiSecret(request: Request): NextResponse | null {
  const secret = Env.NEXT_PUBLIC_API_SECRET;
  if (!secret) {
    return null;
  }

  if (request.headers.get("x-api-secret") !== secret) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  return null;
}
