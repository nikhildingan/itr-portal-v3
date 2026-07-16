import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import path from 'path'

export async function GET(req: NextRequest) {
  try {
    const fileId = req.nextUrl.searchParams.get('fileId')
    if (!fileId) {
      return NextResponse.json({ error: 'Missing fileId' }, { status: 400 })
    }

    const file = await db.adminFile.findUnique({ where: { id: fileId } })
    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Serve from database (Vercel /tmp is ephemeral — files on disk don't persist)
    if (file.fileData && file.fileData.length > 0) {
      const ext = path.extname(file.fileName).toLowerCase()
      const mimeMap: Record<string, string> = {
        '.pdf': 'application/pdf',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.xls': 'application/vnd.ms-excel',
        '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }

      return new NextResponse(file.fileData as unknown as ReadableStream, {
        headers: {
          'Content-Type': mimeMap[ext] || 'application/octet-stream',
          'Content-Disposition': `attachment; filename="${file.fileName}"`,
          'Content-Length': String(file.fileData.length),
        },
      })
    }

    // Fallback: if fileData is null (old uploads before this fix), try disk
    const { existsSync, createReadStream } = await import('fs')
    const UPLOAD_DIR = '/tmp/itr-uploads'
    const filePath = path.join(UPLOAD_DIR, file.clientId, 'admin', file.filePath)

    if (!existsSync(filePath)) {
      return NextResponse.json(
        { error: 'File not available. Please ask admin to re-upload.' },
        { status: 404 }
      )
    }

    const stream = createReadStream(filePath)
    const ext = path.extname(file.fileName).toLowerCase()
    const mimeMap: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }

    return new NextResponse(stream as unknown as ReadableStream, {
      headers: {
        'Content-Type': mimeMap[ext] || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${file.fileName}"`,
      },
    })
  } catch (error) {
    console.error('Download client file error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}