import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

function setAuthCookies(res: NextResponse, params: { session?: string; orgId?: string; email?: string }) {
  const isProd = process.env.NODE_ENV === "production"
  if (params.session) {
    res.cookies.set("jp_session", params.session, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    })
  }
  if (params.orgId) {
    res.cookies.set("jp_org", params.orgId, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    })
  }
  if (params.email) {
    res.cookies.set("jp_email", params.email, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    })
  }
}

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
    // B2B Magic Link authenticate (organization-level)
    const resp = await fetch("https://test.stytch.com/v1/b2b/magic_links/authenticate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${basicAuth}`,
      },
      body: JSON.stringify({ magic_links_token: token }),
    })
    const json: any = await resp.json().catch(() => ({}))
    if (!resp.ok) return NextResponse.json(json, { status: resp.status })

    const session_token = json?.session_token
    const member = json?.member
    const organization = json?.organization

    const res = NextResponse.json({ session_token, member, organization })
    setAuthCookies(res, {
      session: session_token,
      orgId: organization?.organization_id,
      email: member?.email_address,
    })
    return res
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || "error" }, { status: 500 })
  }
}

