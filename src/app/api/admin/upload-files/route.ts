import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import path from 'path'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const clientId = formData.get('clientId') as string
    const description = formData.get('description') as string | null

    if (!clientId) {
      return NextResponse.json({ error: 'Missing clientId' }, { status: 400 })
    }

    const client = await db.iTRClient.findUnique({ where: { id: clientId } })
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const files = formData.getAll('files') as File[]
    const results: Array<{ id: string; fileName: string; filePath: string; description: string | null; createdAt: Date }> = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!file || file.size === 0) continue

      const fileExt = path.extname(file.name) || '.bin'
      const uniqueName = `ADMIN_${Date.now()}_${i}${fileExt}`

      // Read file as buffer and store in DB (Vercel /tmp is ephemeral)
      const buffer = Buffer.from(await file.arrayBuffer())

      const adminFile = await db.adminFile.create({
        data: {
          clientId,
          fileName: file.name,
          filePath: uniqueName,
          description: description || `Filed form ${i + 1}`,
          fileData: buffer,
        },
      })

      results.push(adminFile)
    }

    return NextResponse.json({ success: true, files: results })
  } catch (error) {
    console.error('Upload admin files error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}