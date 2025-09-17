import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ message: "email is required" }, { status: 400 })

    const projectId = process.env.STYTCH_PROJECT_ID
    const secret = process.env.STYTCH_SECRET
    const proto = req.headers.get("x-forwarded-proto") || "http"
    const hostHeader = req.headers.get("host") || "localhost:3002"
    const origin = process.env.NEXT_PUBLIC_PORTAL_BASE_URL || `${proto}://${hostHeader}`

    if (!projectId || !secret) {
      return NextResponse.json({ message: "Stytch env not configured" }, { status: 500 })
    }

    const basicAuth = Buffer.from(`${projectId}:${secret}`).toString("base64")
    // Stytch B2B Discovery flow: send discovery magic link
    const resp = await fetch("https://test.stytch.com/v1/b2b/magic_links/email/discovery/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${basicAuth}`,
      },
      body: JSON.stringify({
        email_address: email,
        discovery_redirect_url: `${origin}/auth/callback`,
      }),
    })
    const json = await resp.json().catch(() => ({}))
    if (!resp.ok) return NextResponse.json(json, { status: resp.status })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || "error" }, { status: 500 })
  }
}

