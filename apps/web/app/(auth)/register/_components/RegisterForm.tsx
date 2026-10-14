"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { postRegister } from "@/lib/auth"

type Fields = {
  username: string
  email: string
  password: string
  confirmPassword: string
}

type FieldErrors = Partial<Record<keyof Fields, string>>

function passwordStrength(password: string): "weak" | "fair" | "strong" {
  if (password.length < 8) return "weak"
  let score = 0
  if (/[a-z]/.test(password)) score++
  if (/[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++
  if (score >= 4) return "strong"
  if (score >= 3) return "fair"
  return "weak"
}

function validateField(name: keyof Fields, fields: Fields): string | undefined {
  if (name === "username" && !fields.username.trim()) return "Username is required"
  if (name === "email") {
    if (!fields.email.trim()) return "Email is required"
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) return "Invalid email address"
  }
  if (name === "password") {
    if (!fields.password) return "Password is required"
    if (fields.password.length < 8) return "Password must be at least 8 characters"
  }
  if (name === "confirmPassword" && fields.confirmPassword !== fields.password) return "Passwords do not match"
  return undefined
}

export default function RegisterForm() {
  const router = useRouter()
  const [fields, setFields] = useState<Fields>({ username: "", email: "", password: "", confirmPassword: "" })
  const [errors, setErrors] = useState<FieldErrors>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setFields(prev => ({ ...prev, [name]: value }))
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    const { name, value } = e.target
    const updated = { ...fields, [name]: value }
    const error = validateField(name as keyof Fields, updated)
    setErrors(prev => ({ ...prev, [name]: error }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const newErrors: FieldErrors = {}
    const keys: (keyof Fields)[] = ["username", "email", "password", "confirmPassword"]
    for (const key of keys) {
      const error = validateField(key, fields)
      if (error) newErrors[key] = error
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    setLoading(true)
    setServerError(null)
    try {
      await postRegister(fields.username.trim(), fields.email.trim(), fields.password)
      router.push("/")
    } catch (err) {
      if (err instanceof Error) {
        const code = (err as Error & { code?: string }).code
        if (code === "username_taken") {
          setErrors(prev => ({ ...prev, username: err.message }))
        } else if (code === "email_taken") {
          setErrors(prev => ({ ...prev, email: err.message }))
        } else {
          setServerError(err.message)
        }
      } else {
        setServerError("Registration failed")
      }
    } finally {
      setLoading(false)
    }
  }

  const strength = fields.password ? passwordStrength(fields.password) : null

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
      {serverError && (
        <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {serverError}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium mb-1">Username</label>
        <input
          name="username"
          value={fields.username}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={loading}
          className="w-full rounded border px-3 py-2 text-sm disabled:opacity-50"
        />
        {errors.username && <p className="mt-1 text-xs text-red-600">{errors.username}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          name="email"
          type="email"
          value={fields.email}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={loading}
          className="w-full rounded border px-3 py-2 text-sm disabled:opacity-50"
        />
        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Password</label>
        <input
          name="password"
          type="password"
          value={fields.password}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={loading}
          className="w-full rounded border px-3 py-2 text-sm disabled:opacity-50"
        />
        {strength && (
          <p className={`mt-1 text-xs ${strength === "strong" ? "text-green-600" : strength === "fair" ? "text-yellow-600" : "text-red-600"}`}>
            {strength === "weak" ? "Weak" : strength === "fair" ? "Fair" : "Strong"}
          </p>
        )}
        {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Confirm Password</label>
        <input
          name="confirmPassword"
          type="password"
          value={fields.confirmPassword}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={loading}
          className="w-full rounded border px-3 py-2 text-sm disabled:opacity-50"
        />
        {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>}
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded bg-black py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Registering...
          </span>
        ) : "Register"}
      </button>
    </form>
  )
}
