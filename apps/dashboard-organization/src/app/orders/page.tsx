"use client"

import React, { useEffect, useMemo, useState } from "react"

const MEDUSA_URL = process.env.NEXT_PUBLIC_MEDUSA_URL || "http://localhost:9000"
const DEV_SECRET = process.env.NEXT_PUBLIC_DEV_ENDPOINT_SECRET
const DEFAULT_SC = process.env.NEXT_PUBLIC_SALES_CHANNEL_ID

type Order = {
  id: string
  created_at?: string
  status?: string
  email?: string
  currency_code?: string
  total?: number
}

export default function OrgOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [salesChannelId, setSalesChannelId] = useState<string>(DEFAULT_SC || "")

  const url = useMemo(() => {
    const u = new URL(`${MEDUSA_URL}/organizations/orders`)
    if (salesChannelId) u.searchParams.set("sales_channel_id", salesChannelId)
    u.searchParams.set("take", "50")
    return u.toString()
  }, [salesChannelId])

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(url, {
          headers: {
            ...(DEV_SECRET ? { "X-Dev-Secret": DEV_SECRET } : {}),
          },
        })
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body?.message || `Request failed with ${res.status}`)
        }
        const data = await res.json()
        setOrders(data.orders || [])
      } catch (e: any) {
        setError(e?.message || "Failed to load orders")
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [url])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Organization Orders</h1>

      <div className="mb-4 flex gap-2 items-end">
        <div className="flex flex-col">
          <label className="text-sm text-gray-600">Sales Channel ID</label>
          <input
            className="border rounded px-2 py-1 min-w-[360px]"
            placeholder="prochannel_..."
            value={salesChannelId}
            onChange={(e) => setSalesChannelId(e.target.value)}
          />
        </div>
        <button
          className="border px-3 py-1 rounded"
          onClick={() => setSalesChannelId((v) => v.trim())}
        >
          Apply
        </button>
      </div>

      {loading && <div>Loading orders…</div>}
      {error && (
        <div className="text-red-600 mb-2">Error: {error}</div>
      )}

      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-2 border">Order</th>
                <th className="text-left p-2 border">Created</th>
                <th className="text-left p-2 border">Customer</th>
                <th className="text-left p-2 border">Status</th>
                <th className="text-left p-2 border">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="p-2 border font-mono">{o.id}</td>
                  <td className="p-2 border">{o.created_at ? new Date(o.created_at).toLocaleString() : ""}</td>
                  <td className="p-2 border">{o.email || "-"}</td>
                  <td className="p-2 border">{o.status}</td>
                  <td className="p-2 border">
                    {typeof o.total === "number" ? (
                      <span>
                        {o.total / 100} {o.currency_code?.toUpperCase()}
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td className="p-4 text-center text-gray-500" colSpan={5}>
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

