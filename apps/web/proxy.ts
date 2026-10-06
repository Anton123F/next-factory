import { jwtVerify } from "jose"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET ?? "change-me-in-production")

export async function proxy(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }
  try {
    await jwtVerify(token, SECRET)
    return NextResponse.next()
  } catch {
    return NextResponse.redirect(new URL("/login", request.url))
  }
}

export const config = {
  matcher: ["/((?!login|api|_next/static|_next/image|favicon.ico).*)"],
}
