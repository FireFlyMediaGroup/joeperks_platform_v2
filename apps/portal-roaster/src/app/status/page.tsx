"use client"

import { useEffect, useMemo, useState } from "react"

const API_BASE = process.env.NEXT_PUBLIC_MEDUSA_URL || "http://localhost:9000"

export default function StatusPage() {
  const [token, setToken] = useState("")
  const [stytchToken, setStytchToken] = useState("")
  const [vendor, setVendor] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [devSecret, setDevSecret] = useState("")
  const [commissionRateBps, setCommissionRateBps] = useState(1000)
  const [payoutSchedule, setPayoutSchedule] = useState("weekly")

  useEffect(() => {
    const t = localStorage.getItem("dev_token") || ""
    setToken(t)
    const s = localStorage.getItem("stytch_session_token") || ""
    setStytchToken(s)
    // Try load on mount
    const bearer = s || t
    if (bearer) refresh(bearer)
  }, [])

  const bearer = token || stytchToken
  const headers = useMemo(() => ({
    "Content-Type": "application/json",
    ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
  }), [bearer])

  async function refresh(tok?: string) {
    const t = tok || token
    if (!t) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/vendors/intake`, { headers: { ...headers, Authorization: `Bearer ${t}` } })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || "Failed to load")
      setVendor(data.vendor)
    } catch (e: any) {
      setError(e?.message || "Error")
    } finally {
      setLoading(false)
    }
  }

  async function startStripeOnboarding() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/vendors/stripe/onboarding`, { method: "POST", headers })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || "Stripe error")
      if (data.url) {
        window.location.href = data.url
      } else {
        setError("No onboarding URL returned")
      }
    } catch (e: any) {
      setError(e?.message || "Error")
    } finally {
      setLoading(false)
    }
  }

  async function approveNow() {
    if (!vendor?.id) return
    if (!devSecret) { setError("Enter Dev Secret to approve"); return }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/operators/vendors/${vendor.id}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Dev-Secret": devSecret,
        },
        body: JSON.stringify({ commission_rate_bps: commissionRateBps, payout_schedule: payoutSchedule }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || "Approve failed")
      // data.result?.vendor or data.vendor depending on implementation
      await refresh()
    } catch (e: any) {
      setError(e?.message || "Error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Application Status</h1>

      <section className="space-y-2 border p-4 rounded">
        <h2 className="font-medium">Auth</h2>
        <div className="flex gap-2">
          <input className="border rounded px-2 py-1 flex-1" value={token} onChange={(e) => setToken(e.target.value)} placeholder="dev:actor:..." />
          <button onClick={() => { localStorage.setItem("dev_token", token); refresh(token) }} className="px-3 py-1 border rounded">Load</button>
        </div>
      </section>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <section className="border p-4 rounded text-sm space-y-2">
        <div><span className="font-medium">Vendor:</span> {vendor?.name || vendor?.id || "-"}</div>
        <div><span className="font-medium">Status:</span> {vendor?.vendor_status || "-"}</div>
        <div className="text-gray-600">Stripe onboarding becomes available after starting intake.</div>
        <button disabled={loading} onClick={startStripeOnboarding} className="px-3 py-1 border rounded">Start Stripe Onboarding</button>
      </section>

      <section className="border p-4 rounded text-sm space-y-2">
        <h2 className="font-medium">Dev-only: Operator Approval</h2>
        <p className="text-gray-600">Use your DEV_ENDPOINT_SECRET to approve this vendor (local dev only).</p>
        <input className="border rounded px-2 py-1 w-full" placeholder="Dev Secret" value={devSecret} onChange={(e)=>setDevSecret(e.target.value)} />
        <div className="flex gap-2">
          <input className="border rounded px-2 py-1" type="number" value={commissionRateBps} onChange={(e)=>setCommissionRateBps(parseInt(e.target.value||"0"))} />
          <input className="border rounded px-2 py-1" value={payoutSchedule} onChange={(e)=>setPayoutSchedule(e.target.value)} />
          <button disabled={loading || !vendor?.id} onClick={approveNow} className="px-3 py-1 border rounded">Approve now (dev)</button>
        </div>
      </section>
    </main>
  )
}

