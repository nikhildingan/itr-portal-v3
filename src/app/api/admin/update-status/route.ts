import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { clientId, status } = await req.json()

    if (!clientId || !status) {
      return NextResponse.json({ error: 'Missing clientId or status' }, { status: 400 })
    }

    const validStatuses = ['PROCESSING', 'QUERY_PENDING', 'FILED', 'VERIFIED', 'COMPLETED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const client = await db.iTRClient.findUnique({ where: { id: clientId } })
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const updated = await db.iTRClient.update({
      where: { id: clientId },
      data: { status },
    })

    return NextResponse.json({ success: true, client: updated })
  } catch (error) {
    console.error('Update status error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}