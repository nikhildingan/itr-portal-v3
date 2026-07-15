import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await db.iTRClient.count()
    return NextResponse.json({ status: 'ok', db: 'connected' })
  } catch (err) {
    return NextResponse.json({ status: 'error', db: 'disconnected', error: String(err) }, { status: 503 })
  }
}