import { jwtVerify } from "jose"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET ?? "change-me-in-production")

export default async function Home() {
  const cookieStore = await cookies()
  const token = cookieStore.get("access_token")?.value

  if (!token) {
    redirect("/login")
  }

  let username: string
  try {
    const { payload } = await jwtVerify(token, SECRET)
    username = payload.sub as string
  } catch {
    redirect("/login")
  }

  return (
    <div className="flex flex-1 items-center justify-center min-h-screen">
      <h1 className="text-3xl font-semibold">Hello, {username}</h1>
    </div>
  )
}
