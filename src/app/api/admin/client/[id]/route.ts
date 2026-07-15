import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { unlink, rm } from 'fs/promises'
import path from 'path'

const UPLOAD_DIR = '/tmp/itr-uploads'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const client = await db.iTRClient.findUnique({
      where: { id },
      include: {
        documents: { orderBy: { createdAt: 'asc' } },
        adminFiles: { orderBy: { createdAt: 'desc' } },
      },
    })

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    return NextResponse.json({ client })
  } catch (error) {
    console.error('Get client error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { status, name, phone, email } = body

    const client = await db.iTRClient.findUnique({ where: { id } })
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    if (status) updateData.status = status
    if (name) updateData.name = name
    if (phone) updateData.phone = phone
    if (email) updateData.email = email

    const updated = await db.iTRClient.update({
      where: { id },
      data: updateData,
      include: {
        documents: true,
        adminFiles: true,
      },
    })

    return NextResponse.json({ client: updated })
  } catch (error) {
    console.error('Update client error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const client = await db.iTRClient.findUnique({
      where: { id },
      include: { documents: true, adminFiles: true },
    })

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    for (const doc of client.documents) {
      try {
        await unlink(path.join(UPLOAD_DIR, id, doc.filePath))
      } catch { /* ignore missing files */ }
    }

    for (const file of client.adminFiles) {
      try {
        await unlink(path.join(UPLOAD_DIR, id, 'admin', file.filePath))
      } catch { /* ignore missing files */ }
    }

    try {
      await rm(path.join(UPLOAD_DIR, id), { recursive: true, force: true })
    } catch { /* ignore */ }

    await db.adminFile.deleteMany({ where: { clientId: id } })
    await db.clientDocument.deleteMany({ where: { clientId: id } })
    await db.iTRClient.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'Client deleted successfully' })
  } catch (error) {
    console.error('Delete client error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}