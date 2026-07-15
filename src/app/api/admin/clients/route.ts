import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const clients = await db.iTRClient.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        documents: { orderBy: { createdAt: 'asc' } },
        adminFiles: { orderBy: { createdAt: 'desc' } },
      },
    })

    const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
      PROCESSING: { label: 'Processing', color: 'text-blue-700', bgColor: 'bg-blue-100 border-blue-400' },
      QUERY_PENDING: { label: 'Query Pending', color: 'text-yellow-700', bgColor: 'bg-yellow-100 border-yellow-400' },
      FILED: { label: 'Filed', color: 'text-orange-700', bgColor: 'bg-orange-100 border-orange-400' },
      VERIFIED: { label: 'Verified', color: 'text-emerald-700', bgColor: 'bg-emerald-100 border-emerald-400' },
      COMPLETED: { label: 'Completed', color: 'text-green-700', bgColor: 'bg-green-100 border-green-500' },
    }

    return NextResponse.json({
      clients: clients.map((c) => {
        const sc = statusConfig[c.status] || statusConfig.PROCESSING
        return {
          id: c.id,
          token: c.token,
          name: c.name,
          phone: c.phone,
          email: c.email,
          pan: c.pan,
          isFirstTimeFiling: c.isFirstTimeFiling,
          aadharNumber: c.aadharNumber,
          bankName: c.bankName,
          ifscCode: c.ifscCode,
          accountNumber: c.accountNumber,
          status: c.status,
          statusLabel: sc.label,
          statusColor: sc.color,
          statusBgColor: sc.bgColor,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
          notes: (c as unknown as { notes: string | null }).notes || null,
          documentCount: c.documents.length,
          documents: c.documents,
          adminFiles: c.adminFiles,
        }
      }),
    })
  } catch (error) {
    console.error('List clients error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}