import { jwtVerify } from "jose"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import RegisterForm from "./_components/RegisterForm"

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET ?? "change-me-in-production")

export default async function Register() {
  const cookieStore = await cookies()
  const token = cookieStore.get("access_token")?.value

  if (token) {
    try {
      await jwtVerify(token, SECRET)
      redirect("/")
    } catch {
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center min-h-screen">
      <RegisterForm />
    </div>
  )
}
