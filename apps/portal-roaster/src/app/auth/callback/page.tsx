"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function AuthCallbackPage() {
  const router = useRouter()
  const sp = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function run() {
      try {
        setError(null)
        const tokenParam = sp.get("token") || sp.get("stytch_token")
        const tokenType = sp.get("stytch_token_type")
        // Discovery token can arrive either as discovery_magic_links_token or token with stytch_token_type=discovery
        const discoveryToken = sp.get("discovery_magic_links_token") || (tokenType === "discovery" ? tokenParam : null)
        const magicToken = tokenType === "discovery" ? null : tokenParam

        // Discovery flow (B2B, new org or join existing)
        if (discoveryToken) {
          const authRes = await fetch("/api/auth/stytch/discovery/authenticate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: discoveryToken }),
          })
          const authData = await authRes.json()
          if (!authRes.ok) throw new Error(authData?.message || "Discovery authenticate failed")

          const ist: string | undefined = authData?.intermediate_session_token
          const orgs: any[] = authData?.discovered_organizations || []
          const email = authData?.email_address || ""
          if (email) localStorage.setItem("stytch_user_email", email)
          if (!ist) throw new Error("Missing intermediate session token")

          if (orgs.length > 0) {
            // Hand off to org selector page
            if (typeof window !== "undefined") {
              sessionStorage.setItem("stytch_ist", ist)
              sessionStorage.setItem("stytch_discovered_orgs", JSON.stringify(orgs))
            }
            router.replace("/auth/select-org")
            return
          }

          // No orgs discovered -> create new using stored roaster name
          const orgName = localStorage.getItem("apply_roaster_name") || `Roaster (${email || "new"})`
          const crRes = await fetch("/api/auth/stytch/discovery/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ intermediate_session_token: ist, organization_name: orgName }),
          })
          const finalData = await crRes.json()
          if (!crRes.ok) throw new Error(finalData?.message || "Create organization failed")

          if (finalData?.session_token) {
            localStorage.setItem("stytch_session_token", finalData.session_token)
            try {
              await fetch("/api/session/set", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ session_token: finalData.session_token }) })
            } catch {}
          }
          const mEmail = finalData?.member?.email_address || email || ""
          if (mEmail) localStorage.setItem("stytch_user_email", mEmail)

          router.replace("/o/me/dashboard")
          return
        }

        // Organization Magic Link flow (B2B non-discovery)
        if (magicToken) {
          const res = await fetch("/api/auth/stytch/authenticate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: magicToken }),
          })
          const data = await res.json()
          if (!res.ok) throw new Error(data?.message || "Auth failed")
          if (data.session_token) {
            localStorage.setItem("stytch_session_token", data.session_token)
            localStorage.setItem("stytch_user_email", data?.member?.email_address || "")
            try {
              await fetch("/api/session/set", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ session_token: data.session_token }) })
            } catch {}
          }
          router.replace("/o/me/dashboard")
          return
        }

        setError("Missing token")
      } catch (e: any) {
        setError(e?.message || "Authentication error")
      }
    }
    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <main className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Signing you in…</h1>
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </main>
  )
}
