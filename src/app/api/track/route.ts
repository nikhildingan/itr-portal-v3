import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json()

    if (!token || !token.trim()) {
      return NextResponse.json(
        { error: 'Please provide your tracking token number.' },
        { status: 400 }
      )
    }

    const client = await db.iTRClient.findUnique({
      where: { token: token.toUpperCase().trim() },
      include: {
        documents: { orderBy: { createdAt: 'asc' } },
        adminFiles: { orderBy: { createdAt: 'desc' } },
      },
    })

    if (!client) {
      return NextResponse.json(
        { error: 'No record found with this token. Please check and try again.' },
        { status: 404 }
      )
    }

    const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
      PROCESSING: { label: 'Processing', color: 'text-blue-700', bgColor: 'bg-blue-100 border-blue-300' },
      QUERY_PENDING: { label: 'Query Pending', color: 'text-yellow-700', bgColor: 'bg-yellow-100 border-yellow-300' },
      FILED: { label: 'Filed', color: 'text-orange-700', bgColor: 'bg-orange-100 border-orange-300' },
      VERIFIED: { label: 'Verified', color: 'text-green-700', bgColor: 'bg-green-100 border-green-300' },
      COMPLETED: { label: 'Completed', color: 'text-green-700', bgColor: 'bg-green-100 border-green-300' },
    }

    const sc = statusConfig[client.status] || statusConfig.PROCESSING

    return NextResponse.json({
      token: client.token,
      name: client.name,
      pan: client.pan,
      status: client.status,
      statusLabel: sc.label,
      statusColor: sc.color,
      statusBgColor: sc.bgColor,
      createdAt: client.createdAt,
      notes: (client as unknown as { notes: string | null }).notes || null,
      documents: client.documents.map((d) => ({
        id: d.id,
        fileName: d.fileName,
        fileType: d.fileType,
        uploadedAt: d.createdAt,
      })),
      adminFiles: client.adminFiles.map((f) => ({
        id: f.id,
        fileName: f.fileName,
        description: f.description,
        uploadedAt: f.createdAt,
      })),
    })
  } catch (error) {
    console.error('Track error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}