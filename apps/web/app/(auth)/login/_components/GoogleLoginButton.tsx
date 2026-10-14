"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

type State = "idle" | "loading" | "error"

export default function GoogleLoginButton() {
  const [state, setState] = useState<State>("idle")
  const [error, setError] = useState<string | null>(null)

  function handleClick() {
    setState("loading")
    setError(null)
    window.location.href = "http://localhost:8000/api/v1/auth/login/google"
  }

  return (
    <Card className="w-full max-w-sm">
      <CardContent className="pt-6 flex flex-col gap-4">
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button onClick={handleClick} disabled={state === "loading"}>
          {state === "loading" ? "Redirecting…" : "Sign in with Google"}
        </Button>
      </CardContent>
    </Card>
  )
}
