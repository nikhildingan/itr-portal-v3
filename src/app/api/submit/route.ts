import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateToken } from '@/lib/token'
import { sendTokenEmail } from '@/lib/email'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

const UPLOAD_DIR = '/tmp/itr-uploads'

const DOC_CATEGORIES = [
  'PAN_CARD', 'AADHAR_CARD', 'FORM_16', 'SALARY_SLIPS',
  'SHARE_TRADING', 'MF_CAPITAL_GAIN', 'OTHER_DEDUCTIONS',
  'HOUSE_LOAN', 'TCS_TDS', 'BANK_STATEMENT', 'OTHERS',
] as const

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()

    const name = formData.get('name') as string
    const phone = (formData.get('phone') as string) || ''
    const email = formData.get('email') as string
    const pan = (formData.get('pan') as string)?.toUpperCase().trim()
    const portalPassword = (formData.get('portalPassword') as string) || ''
    const isFirstTimeFiling = formData.get('isFirstTimeFiling') === 'true'
    const aadharNumber = (formData.get('aadharNumber') as string) || ''
    const bankName = (formData.get('bankName') as string) || ''
    const ifscCode = (formData.get('ifscCode') as string) || ''
    const accountNumber = (formData.get('accountNumber') as string) || ''
    const notes = (formData.get('notes') as string) || ''

    if (!name || !email || !pan) {
      return NextResponse.json({ error: 'Name, email, and PAN are required' }, { status: 400 })
    }

    // Check DB connection first
    try {
      await db.iTRClient.count()
    } catch (dbErr) {
      console.error('Database connection failed:', dbErr)
      return NextResponse.json({ error: 'Service temporarily unavailable. Please try again in a moment.' }, { status: 503 })
    }

    const existingPan = await db.iTRClient.findFirst({ where: { pan } })
    if (existingPan) {
      return NextResponse.json({ error: 'A submission with this PAN already exists. Please track using your token.' }, { status: 409 })
    }

    const token = generateToken()

    const client = await db.iTRClient.create({
      data: {
        token,
        name,
        phone,
        email,
        pan,
        portalPassword,
        isFirstTimeFiling,
        aadharNumber: isFirstTimeFiling ? aadharNumber : null,
        bankName: isFirstTimeFiling ? bankName : null,
        ifscCode: isFirstTimeFiling ? ifscCode : null,
        accountNumber: isFirstTimeFiling ? accountNumber : null,
        notes: notes || null,
        status: 'PROCESSING',
      },
    })

    const clientDir = path.join(UPLOAD_DIR, client.id)
    await mkdir(clientDir, { recursive: true })

    // Handle each document category
    for (const category of DOC_CATEGORIES) {
      const files = formData.getAll(`doc_${category}`) as File[]
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        if (!file || file.size === 0) continue
        const fileExt = path.extname(file.name) || '.bin'
        const safeCategory = category.replace(/[^A-Z0-9_]/g, '_')
        const uniqueName = `${safeCategory}_${Date.now()}_${i}${fileExt}`
        const filePath = path.join(clientDir, uniqueName)
        const buffer = Buffer.from(await file.arrayBuffer())
        await writeFile(filePath, buffer)

        await db.clientDocument.create({
          data: {
            clientId: client.id,
            fileName: file.name,
            filePath: uniqueName,
            fileType: category,
          },
        })
      }
    }

    // Build track link using request headers for correct domain in any environment
    const proto = req.headers.get('x-forwarded-proto') || 'https'
    const host = req.headers.get('host') || ''
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (host ? `${proto}://${host}` : '')
    const trackLink = `${baseUrl}/?token=${token}&action=track`
    // Send email — MUST await in Vercel serverless (fire-and-forget gets killed)
    const emailSent = await sendTokenEmail(email, name, token, trackLink)
    console.log(`[SUBMIT] Email to ${email}: ${emailSent ? 'SENT' : 'FAILED'}`)

    return NextResponse.json({
      token,
      message: 'ITR information submitted successfully',
      emailSent,
    })
  } catch (error) {
    console.error('Submit error:', error)
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: `Submission failed: ${msg}` }, { status: 500 })
  }
}