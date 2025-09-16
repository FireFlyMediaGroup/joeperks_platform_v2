import { NextRequest, NextResponse } from "next/server"

export const runtime = "edge"

export async function POST(req: NextRequest) {
  try {
    const { session_token, org_slug } = await req.json()
    if (!session_token) return NextResponse.json({ message: "session_token is required" }, { status: 400 })

    const res = NextResponse.json({ ok: true })

    // Set httpOnly session cookie used by middleware
    res.cookies.set("jp_session", session_token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })

    // Optional org slug cookie for UX; server never trusts it
    if (org_slug) {
      res.cookies.set("jp_org", org_slug, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      })
    }

    return res
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || "error" }, { status: 500 })
  }
}

