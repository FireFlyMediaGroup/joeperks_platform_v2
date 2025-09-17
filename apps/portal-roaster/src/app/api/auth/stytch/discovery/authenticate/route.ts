import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json()
    if (!token) return NextResponse.json({ message: "token is required" }, { status: 400 })

    const projectId = process.env.STYTCH_PROJECT_ID
    const secret = process.env.STYTCH_SECRET

    if (!projectId || !secret) {
      return NextResponse.json({ message: "Stytch env not configured" }, { status: 500 })
    }

    const basicAuth = Buffer.from(`${projectId}:${secret}`).toString("base64")
    const resp = await fetch("https://test.stytch.com/v1/b2b/magic_links/discovery/authenticate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${basicAuth}`,
      },
      body: JSON.stringify({ discovery_magic_links_token: token }),
    })
    const json: any = await resp.json().catch(() => ({}))
    if (!resp.ok) return NextResponse.json(json, { status: resp.status })

    // Return the intermediate token and discovered orgs to the client
    const intermediate_session_token = json?.intermediate_session_token
    const discovered_organizations = json?.discovered_organizations || []
    const email_address = json?.email_address || null

    return NextResponse.json({ intermediate_session_token, discovered_organizations, email_address })
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || "error" }, { status: 500 })
  }
}

