import { NextResponse } from 'next/server'
import { verifySMTP, sendTokenEmail } from '@/lib/email'

export const runtime = 'nodejs'
export const maxDuration = 30

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const testTo = searchParams.get('to')

  // Step 1: Check if env vars exist
  const email = process.env.SMTP_EMAIL
  const pass = process.env.SMTP_PASSWORD

  const report: Record<string, string | boolean> = {
    smtp_email_set: !!email,
    smtp_email_value: email ? email.replace(/(.{2})(.*)(@.*)/, '$1***$3') : 'NOT SET',
    smtp_password_set: !!pass,
    smtp_password_length: pass ? `${pass.length} chars` : 'NOT SET',
  }

  // Step 2: Verify SMTP connection
  const verifyResult = await verifySMTP()
  report.smtp_connected = verifyResult.ok
  if (!verifyResult.ok) {
    report.smtp_error = verifyResult.error || 'Unknown error'
    return NextResponse.json({ status: 'FAIL', report }, { status: 500 })
  }

  // Step 3: If ?to= provided, send a test email
  if (testTo) {
    const sent = await sendTokenEmail(
      testTo,
      'Test User',
      'TMI-TEST-1234',
      `${process.env.NEXT_PUBLIC_BASE_URL || 'https://your-domain.com'}/?token=TMI-TEST-1234&action=track`
    )
    report.test_email_sent = sent
    report.test_email_to = testTo
    if (!sent) {
      return NextResponse.json({ status: 'FAIL', report }, { status: 500 })
    }
  }

  return NextResponse.json({ status: 'OK', report })
}