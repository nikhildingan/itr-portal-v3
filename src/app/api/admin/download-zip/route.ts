import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { existsSync } from 'fs'
import path from 'path'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const archiver = require('archiver')

const UPLOAD_DIR = '/tmp/itr-uploads'

export async function GET(req: NextRequest) {
  try {
    const clientId = req.nextUrl.searchParams.get('clientId')
    if (!clientId) {
      return NextResponse.json({ error: 'Missing clientId' }, { status: 400 })
    }

    const client = await db.iTRClient.findUnique({
      where: { id: clientId },
      include: { documents: true },
    })

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    if (client.documents.length === 0) {
      return NextResponse.json({ error: 'No documents found' }, { status: 404 })
    }

    const archive = archiver('zip', { zlib: { level: 9 } })
    const chunks: Buffer[] = []

    archive.on('data', (chunk: Buffer) => chunks.push(chunk))

    const clientDir = path.join(UPLOAD_DIR, clientId)

    for (const doc of client.documents) {
      const fullPath = path.join(clientDir, doc.filePath)
      if (existsSync(fullPath)) {
        archive.file(fullPath, { name: doc.fileName })
      }
    }

    archive.finalize()

    await new Promise<void>((resolve, reject) => {
      archive.on('end', resolve)
      archive.on('error', reject)
    })

    const zipBuffer = Buffer.concat(chunks)
    const safeName = client.name.replace(/[^a-zA-Z0-9]/g, '_')

    return new NextResponse(zipBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${safeName}_${client.token}_documents.zip"`,
      },
    })
  } catch (error) {
    console.error('Download zip error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}