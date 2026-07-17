import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function DELETE(req: NextRequest) {
  try {
    const { fileId } = await req.json()

    if (!fileId) {
      return NextResponse.json({ error: 'Missing fileId' }, { status: 400 })
    }

    const file = await db.adminFile.findUnique({ where: { id: fileId } })
    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    await db.adminFile.delete({ where: { id: fileId } })

    return NextResponse.json({ success: true, deleted: file.fileName })
  } catch (error) {
    console.error('Delete admin file error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}