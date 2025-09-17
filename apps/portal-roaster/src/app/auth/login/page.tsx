"use client"

import { useState } from "react"
import Link from "next/link"
import { Button, Input, Text } from "@medusajs/ui"

export default function RoasterLoginPage() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle")
  const [message, setMessage] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setStatus("loading")
    setMessage(null)
    try {
      const res = await fetch("/api/auth/stytch/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.message || "Failed to send magic link")
      setStatus("sent")
      setMessage("Check your email for a sign-in link. The link may allow you to select or create your organization.")
    } catch (e: any) {
      setStatus("error")
      setMessage(e?.message || "There was a problem sending the email.")
    }
  }

  return (
    <main style={{ minHeight: "100dvh", display: "grid", placeItems: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ marginBottom: 16 }}>
          <Text as="h1" leading="compact" weight="plus">
            Sign in to your roaster portal
          </Text>
          <Text as="p" size="small" color="subtle">
            Use your work email to receive a magic link. For first-time users, you\'ll be able to apply or join an existing organization after sign-in.
          </Text>
        </div>

        <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
          <div>
            <label htmlFor="email">
              <Text as="span" size="small">Work email</Text>
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
            />
          </div>

          <Button type="submit" variant="primary" isLoading={status === "loading"} disabled={!email || status === "loading"}>
            Send magic link
          </Button>
        </form>

        {message && (
          <div style={{ marginTop: 12 }}>
            <Text as="p" size="xsmall" color={status === "error" ? "danger" : "subtle"}>
              {message}
            </Text>
          </div>
        )}

        <div style={{ marginTop: 20 }}>
          <Text as="p" size="small">
            New to JoePerks?{" "}
            <Link href="/apply" style={{ textDecoration: "underline" }}>
              Apply to sell your coffee with joeperks.com
            </Link>
          </Text>
        </div>
      </div>
    </main>
  )
}

