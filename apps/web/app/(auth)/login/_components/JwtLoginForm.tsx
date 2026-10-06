"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { postJwtLogin } from "@/lib/auth"

type State = "idle" | "loading" | "error" | "success"

export default function JwtLoginForm() {
  const router = useRouter()
  const [state, setState] = useState<State>("idle")
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setState("loading")
    setError(null)

    const formData = new FormData(event.currentTarget)
    const username = formData.get("username") as string
    const password = formData.get("password") as string

    try {
      await postJwtLogin(username, password)
      setState("success")
      router.push("/")
    } catch (err) {
      setState("error")
      setError(err instanceof Error ? err.message : "Login failed")
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input name="username" placeholder="Username" required disabled={state === "loading"} />
          <Input name="password" type="password" placeholder="Password" required disabled={state === "loading"} />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" disabled={state === "loading"}>
            {state === "loading" ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
