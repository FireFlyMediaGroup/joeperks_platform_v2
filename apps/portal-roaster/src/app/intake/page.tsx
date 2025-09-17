"use client"

import { useEffect, useMemo, useState } from "react"

const API_BASE = process.env.NEXT_PUBLIC_MEDUSA_URL || "http://localhost:9000"

export default function IntakePage() {
  const [token, setToken] = useState("")
  const [stytchToken, setStytchToken] = useState("")
  const [intake, setIntake] = useState<any>({ company: { name: "" }, contact: { email: "" } })
  const [vendor, setVendor] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const t = localStorage.getItem("dev_token") || ""
    setToken(t)
    const s = localStorage.getItem("stytch_session_token") || ""
    setStytchToken(s)
  }, [])

  const bearer = token || stytchToken
  const headers = useMemo(() => ({
    "Content-Type": "application/json",
    ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
  }), [bearer])

  async function startIntake() {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/vendors/intake`, { method: "POST", headers, body: JSON.stringify({ name: intake.company?.name || "", admin: { email: intake.contact?.email || "" } }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || "Failed to start intake")
      setVendor(data.vendor)
    } catch (e: any) {
      setError(e?.message || "Error")
    } finally {
      setLoading(false)
    }
  }

  async function saveDraft() {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/vendors/intake`, { method: "PUT", headers, body: JSON.stringify({ intake }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || "Failed to save draft")
      setVendor(data.vendor)
    } catch (e: any) {
      setError(e?.message || "Error")
    } finally {
      setLoading(false)
    }
  }

  async function submit() {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/vendors/intake/submit`, { method: "POST", headers })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || "Failed to submit")
      setVendor(data.vendor)
    } catch (e: any) {
      setError(e?.message || "Error")
    } finally {
      setLoading(false)
    }
  }

  function storeToken() {
    localStorage.setItem("dev_token", token)
  }

  return (
    <main className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Vendor Intake</h1>

      <section className="space-y-2 border p-4 rounded">
        <h2 className="font-medium">Auth</h2>
        <p className="text-sm text-gray-600">Use Stytch login (test) or dev token. Dev token is only for local testing.</p>
        <div className="flex gap-2">
          <a href="/apply" className="px-3 py-1 border rounded">Stytch Sign In</a>
          <input className="border rounded px-2 py-1 flex-1" value={token} onChange={(e) => setToken(e.target.value)} placeholder="dev:actor:..." />
          <button onClick={storeToken} className="px-3 py-1 border rounded">Save</button>
        </div>
      </section>

      <section className="space-y-2 border p-4 rounded">
        <h2 className="font-medium">Company</h2>
        <input className="border rounded px-2 py-1 w-full" placeholder="Company name" value={intake.company?.name || ""} onChange={(e) => setIntake((s:any) => ({ ...s, company: { ...(s.company||{}), name: e.target.value } }))} />
        <input className="border rounded px-2 py-1 w-full" placeholder="Contact email" value={intake.contact?.email || ""} onChange={(e) => setIntake((s:any) => ({ ...s, contact: { ...(s.contact||{}), email: e.target.value } }))} />
        <div className="flex gap-2">
          <button disabled={loading} onClick={startIntake} className="px-3 py-1 border rounded">Start intake</button>
          <button disabled={loading} onClick={saveDraft} className="px-3 py-1 border rounded">Save draft</button>
          <button disabled={loading} onClick={submit} className="px-3 py-1 border rounded">Submit</button>
        </div>
      </section>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {vendor && (
        <section className="border p-4 rounded text-sm">
          <div><span className="font-medium">Vendor:</span> {vendor.name || vendor.id}</div>
          <div><span className="font-medium">Status:</span> {vendor.vendor_status || "-"}</div>
        </section>
      )}
    </main>
  )
}

