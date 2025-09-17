import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({})) as { name?: string; email?: string }
    const name = (body.name || "").trim()
    const email = (body.email || "").trim()

    if (!name || !email) {
      return NextResponse.json({ message: "name and email are required" }, { status: 400 })
    }

    const MEDUSA_URL = process.env.NEXT_PUBLIC_MEDUSA_URL || "http://localhost:9000"
    const DEV_ENDPOINT_SECRET = process.env.DEV_ENDPOINT_SECRET

    if (!DEV_ENDPOINT_SECRET) {
      return NextResponse.json({ message: "DEV_ENDPOINT_SECRET missing on portal server" }, { status: 500 })
    }

    // Create vendor + admin (idempotent dev endpoint)
    const createRes = await fetch(`${MEDUSA_URL}/dev/vendors`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Dev-Secret": DEV_ENDPOINT_SECRET,
      },
      body: JSON.stringify({ name, admin: { email } }),
    })
    const created = await createRes.json().catch(() => ({}))
    if (!createRes.ok) {
      return NextResponse.json(created, { status: createRes.status })
    }

    // Get dev token for the admin
    const tokenRes = await fetch(`${MEDUSA_URL}/dev/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Dev-Secret": DEV_ENDPOINT_SECRET,
      },
      body: JSON.stringify({ type: "actor", email }),
    })
    const tokenJson = await tokenRes.json().catch(() => ({})) as any
    if (!tokenRes.ok) {
      return NextResponse.json(tokenJson, { status: tokenRes.status })
    }
    const token = tokenJson?.token || tokenJson?.access_token

    return NextResponse.json({ token, vendor: created?.vendor ?? null })
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || "error" }, { status: 500 })
  }
}

