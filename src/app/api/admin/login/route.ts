import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json()
    const adminUser = process.env.ADMIN_USER || 'admin'
    const adminPass = process.env.ADMIN_PASSWORD || ''

    if (username === adminUser && password === adminPass) {
      const token = Buffer.from(`${adminUser}:${Date.now()}`).toString('base64')
      return NextResponse.json({ success: true, token, username: adminUser })
    }

    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}