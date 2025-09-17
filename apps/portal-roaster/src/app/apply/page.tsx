"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function ApplyPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [linkSent, setLinkSent] = useState<string | null>(null)

  async function submit() {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch("/api/dev/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || "Failed to start application")
      if (data.token) {
        localStorage.setItem("dev_token", data.token)
      }
      router.push("/intake")
    } catch (e: any) {
      setError(e?.message || "Error")
    } finally {
      setLoading(false)
    }
  }

  async function sendMagicLink() {
    setError(null)
    setLinkSent(null)
    setLoading(true)
    try {
      // Persist for discovery create step after callback
      if (name) localStorage.setItem("apply_roaster_name", name)
      if (email) localStorage.setItem("apply_roaster_email", email)

      const res = await fetch("/api/auth/stytch/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || "Failed to send magic link")
      setLinkSent(email)
    } catch (e: any) {
      setError(e?.message || "Error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Apply to Sell on Joe Perks</h1>
      <p className="text-gray-600">Self-service registration for coffee roasters. Enter your business contact to start.</p>

      <section className="space-y-2 border p-4 rounded">
        <label className="block text-sm">Roaster name</label>
        <input className="border rounded px-2 py-1 w-full" placeholder="Acme Roasters" value={name} onChange={(e)=>setName(e.target.value)} />
        <label className="block text-sm">Contact email</label>
        <input className="border rounded px-2 py-1 w-full" placeholder="owner@acme.com" value={email} onChange={(e)=>setEmail(e.target.value)} />
        <div className="flex gap-2">
          <button disabled={loading || !name || !email} onClick={submit} className="px-3 py-1 border rounded">Start application (dev)</button>
          <button disabled={loading || !email} onClick={sendMagicLink} className="px-3 py-1 border rounded">Send magic link (Stytch test)</button>
        </div>
        {linkSent && <p className="text-green-700 text-sm">Magic link sent to {linkSent}. Check your inbox and click the link to continue.</p>}
      </section>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <section className="text-sm text-gray-600">
        <p>After starting, you’ll complete:</p>
        <ul className="list-disc ml-5">
          <li>Business details</li>
          <li>Stripe Connect onboarding (for payouts)</li>
          <li>Submit for review</li>
        </ul>
      </section>
    </main>
  )
}

