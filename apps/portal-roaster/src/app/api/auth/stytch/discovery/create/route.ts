import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  try {
    const { intermediate_session_token, organization_name } = await req.json()
    if (!intermediate_session_token) return NextResponse.json({ message: "intermediate_session_token is required" }, { status: 400 })

    const projectId = process.env.STYTCH_PROJECT_ID
    const secret = process.env.STYTCH_SECRET

    if (!projectId || !secret) {
      return NextResponse.json({ message: "Stytch env not configured" }, { status: 500 })
    }

    const basicAuth = Buffer.from(`${projectId}:${secret}`).toString("base64")
    const body: any = { intermediate_session_token }
    if (organization_name) body.organization_name = organization_name

    const resp = await fetch("https://test.stytch.com/v1/b2b/discovery/organizations/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${basicAuth}`,
      },
      body: JSON.stringify(body),
    })
    const json: any = await resp.json().catch(() => ({}))
    if (!resp.ok) return NextResponse.json(json, { status: resp.status })

    const session_token = json?.session_token
    const member = json?.member
    const organization = json?.organization

    return NextResponse.json({ session_token, member, organization })
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || "error" }, { status: 500 })
  }
}

