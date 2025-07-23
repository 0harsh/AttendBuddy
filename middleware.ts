import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

async function verifyJWT(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    console.log("✅ JWT verified:", payload);
    return payload;
  } catch (err: any) {
    console.error("❌ JWT verification failed:", err.message);
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  if (!token) {
    console.warn("⚠️ No JWT token found. Redirecting to /login.");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const payload = await verifyJWT(token);

  if (!payload) {
    console.warn("⚠️ Invalid or expired JWT token. Redirecting to /login.");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // ✅ Token is valid, proceed
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"], // Protect only /dashboard
};
