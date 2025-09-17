"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"

interface DiscoveredOrg {
  organization?: { organization_id?: string; organization_name?: string }
  organization_id?: string
  membership?: { type?: string }
}

export default function SelectOrgPage() {
  const router = useRouter()
  const [orgs, setOrgs] = useState<DiscoveredOrg[]>([])
  const [selectedId, setSelectedId] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const ist = useMemo(() => {
    if (typeof window === "undefined") return ""
    return sessionStorage.getItem("stytch_ist") || ""
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const raw = sessionStorage.getItem("stytch_discovered_orgs") || "[]"
      const parsed: DiscoveredOrg[] = JSON.parse(raw)
      setOrgs(parsed)
      const firstId = parsed?.[0]?.organization?.organization_id || parsed?.[0]?.organization_id || ""
      setSelectedId(firstId)
    } catch (e) {
      setError("Could not load discovered organizations")
    }
  }, [])

  async function continueWithExisting() {
    setError(null)
    if (!ist) return setError("Missing session. Please restart the flow.")
    if (!selectedId) return setError("Please select an organization or create a new one.")
    setLoading(true)
    try {
      const res = await fetch("/api/auth/stytch/discovery/exchange", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intermediate_session_token: ist, organization_id: selectedId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || "Failed to join organization")
      if (data.session_token) {
        localStorage.setItem("stytch_session_token", data.session_token)
        localStorage.setItem("stytch_user_email", data?.member?.email_address || "")
      }
      // Clear temporary storage
      sessionStorage.removeItem("stytch_ist")
      sessionStorage.removeItem("stytch_discovered_orgs")
      router.replace("/intake")
    } catch (e: any) {
      setError(e?.message || "Error")
    } finally {
      setLoading(false)
    }
  }

  async function createNewOrganization() {
    setError(null)
    if (!ist) return setError("Missing session. Please restart the flow.")
    setLoading(true)
    try {
      const name = localStorage.getItem("apply_roaster_name") || "New Roaster"
      const res = await fetch("/api/auth/stytch/discovery/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intermediate_session_token: ist, organization_name: name }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || "Failed to create organization")
      if (data.session_token) {
        localStorage.setItem("stytch_session_token", data.session_token)
        localStorage.setItem("stytch_user_email", data?.member?.email_address || "")
      }
      sessionStorage.removeItem("stytch_ist")
      sessionStorage.removeItem("stytch_discovered_orgs")
      router.replace("/intake")
    } catch (e: any) {
      setError(e?.message || "Error")
    } finally {
      setLoading(false)
    }
  }

  function resetFlow() {
    sessionStorage.removeItem("stytch_ist")
    sessionStorage.removeItem("stytch_discovered_orgs")
    router.replace("/apply")
  }

  return (
    <main className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Select your organization</h1>
      <p className="text-gray-600 text-sm">We found organizations associated with your email. Continue with an existing one or create a new organization for your roastery.</p>

      {orgs.length === 0 && (
        <div className="border rounded p-4 text-sm">
          <p>No organizations found. You can create a new one.</p>
          <div className="mt-3 flex gap-2">
            <button onClick={createNewOrganization} disabled={loading} className="px-3 py-1 border rounded">Create new organization</button>
            <button onClick={resetFlow} className="px-3 py-1 border rounded">Use a different email</button>
          </div>
        </div>
      )}

      {orgs.length > 0 && (
        <div className="space-y-3">
          <div className="border rounded">
            {orgs.map((o, idx) => {
              const id = o.organization?.organization_id || o.organization_id || String(idx)
              const name = o.organization?.organization_name || `Organization ${idx + 1}`
              const status = o.membership?.type || ""
              return (
                <label key={id} className="flex items-center gap-3 p-3 border-b last:border-b-0 cursor-pointer">
                  <input
                    type="radio"
                    name="org"
                    value={id}
                    checked={selectedId === id}
                    onChange={() => setSelectedId(id)}
                  />
                  <div className="flex-1">
                    <div className="font-medium">{name}</div>
                    {status && <div className="text-xs text-gray-600">{status}</div>}
                  </div>
                </label>
              )
            })}
          </div>

          <div className="flex gap-2">
            <button onClick={continueWithExisting} disabled={loading || !selectedId} className="px-3 py-1 border rounded">
              Continue with selected
            </button>
            <button onClick={createNewOrganization} disabled={loading} className="px-3 py-1 border rounded">
              Create new organization
            </button>
            <button onClick={resetFlow} className="px-3 py-1 border rounded">Use a different email</button>
          </div>
        </div>
      )}

      {error && <p className="text-red-600 text-sm">{error}</p>}
    </main>
  )
}

