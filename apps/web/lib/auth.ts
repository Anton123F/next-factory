export const COOKIE_ACCESS_TOKEN = "access_token"
export const COOKIE_REFRESH_TOKEN = "refresh_token"

export async function postJwtLogin(username: string, password: string): Promise<string> {
  const response = await fetch("http://localhost:8000/api/v1/auth/login/jwt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
    credentials: "include",
  })
  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data?.detail ?? "Login failed")
  }
  const data = await response.json()
  return data.access_token as string
}
