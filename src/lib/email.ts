import nodemailer from 'nodemailer'

let transporter: nodemailer.Transporter | null = null

function getTransporter(): nodemailer.Transporter | null {
  if (transporter) return transporter

  const user = process.env.SMTP_EMAIL
  const pass = process.env.SMTP_PASSWORD

  if (!user || !pass) {
    console.error('[EMAIL] SMTP_EMAIL or SMTP_PASSWORD not set in environment variables')
    return null
  }

  transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user, pass },
    connectionTimeout: 15000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  })

  return transporter
}

export async function verifySMTP(): Promise<{ ok: boolean; error?: string }> {
  try {
    const transport = getTransporter()
    if (!transport) return { ok: false, error: 'SMTP credentials not configured' }
    await transport.verify()
    return { ok: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[EMAIL] SMTP verification failed:', msg)
    return { ok: false, error: msg }
  }
}

export async function sendTokenEmail(
  toEmail: string,
  clientName: string,
  token: string,
  trackLink: string
): Promise<boolean> {
  const transport = getTransporter()
  if (!transport) {
    console.warn(`Skipping email to ${toEmail} — SMTP not configured`)
    return false
  }

  try {
    const mailResult = await transport.sendMail({
      from: `"TaxMattersIndia" <${process.env.SMTP_EMAIL}>`,
      to: toEmail,
      subject: `Congratulations! Your ITR Filing is Underway — Token: ${token}`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, Helvetica, sans-serif; max-width: 620px; margin: 0 auto; padding: 0; background: #f0f4f8;">
          <!-- Top Banner -->
          <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #1d4ed8 100%); padding: 32px 28px; text-align: center; border-radius: 16px 16px 0 0;">
            <div style="display: inline-flex; align-items: center; gap: 10px; margin-bottom: 14px;">
              <div style="background: rgba(255,255,255,0.15); backdrop-filter: blur(10px); padding: 8px 14px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.2);">
                <span style="color: white; font-weight: 800; font-size: 14px; letter-spacing: 1px;">TMI</span>
              </div>
              <span style="color: rgba(255,255,255,0.8); font-size: 13px; font-weight: 500;">TaxMattersIndia</span>
            </div>
            <h1 style="margin: 0; font-size: 26px; font-weight: 800; color: white; line-height: 1.3;">Congratulations, ${clientName}! 🎉</h1>
            <p style="margin: 10px 0 0; color: rgba(255,255,255,0.85); font-size: 15px; line-height: 1.5;">Your ITR filing is now being handled by our expert team</p>
          </div>

          <!-- Main Body -->
          <div style="background: #ffffff; padding: 32px 28px; border-left: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0;">
            <!-- Congrats message -->
            <div style="background: linear-gradient(135deg, #ecfdf5, #d1fae5); border: 1px solid #a7f3d0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
              <p style="margin: 0; font-size: 15px; color: #065f46; line-height: 1.6;">
                <strong>Great news!</strong> Your ITR filing information and documents have been received successfully. Rest assured, the <strong>TaxMattersIndia</strong> team is now taking care of everything for you.
              </p>
            </div>

            <!-- Token Section -->
            <p style="color: #475569; font-size: 14px; margin: 0 0 8px; font-weight: 600;">Your Unique Tracking Token</p>
            <div style="background: linear-gradient(135deg, #eff6ff, #dbeafe); border-left: 4px solid #2563eb; padding: 24px; border-radius: 0 12px 12px 0; margin-bottom: 24px;">
              <p style="margin: 0; font-size: 36px; font-weight: 900; color: #1e3a5f; letter-spacing: 3px; font-family: 'Courier New', monospace; text-align: center;">
                ${token}
              </p>
              <p style="margin: 8px 0 0; color: #64748b; font-size: 13px; text-align: center;">
                Save this token to track your ITR filing progress anytime
              </p>
            </div>

            <!-- What happens next -->
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
              <p style="margin: 0 0 14px; color: #1e293b; font-weight: 700; font-size: 15px;">What happens next?</p>
              <div style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px;">
                <div style="min-width: 28px; height: 28px; background: #2563eb; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px;">1</div>
                <div>
                  <p style="margin: 0; color: #334155; font-size: 14px; font-weight: 600;">Document Review</p>
                  <p style="margin: 2px 0 0; color: #64748b; font-size: 13px;">Our experts will review your documents thoroughly</p>
                </div>
              </div>
              <div style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px;">
                <div style="min-width: 28px; height: 28px; background: #2563eb; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px;">2</div>
                <div>
                  <p style="margin: 0; color: #334155; font-size: 14px; font-weight: 600;">ITR Filing</p>
                  <p style="margin: 2px 0 0; color: #64748b; font-size: 13px;">We file your return on the Income Tax portal</p>
                </div>
              </div>
              <div style="display: flex; align-items: flex-start; gap: 12px;">
                <div style="min-width: 28px; height: 28px; background: #2563eb; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px;">3</div>
                <div>
                  <p style="margin: 0; color: #334155; font-size: 14px; font-weight: 600;">Acknowledgement</p>
                  <p style="margin: 2px 0 0; color: #64748b; font-size: 13px;">Download your filed ITR and acknowledgement from the tracking page</p>
                </div>
              </div>
            </div>

            <!-- Track Button -->
            <div style="text-align: center; margin: 28px 0;">
              <a href="${trackLink}" style="display: inline-block; background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 14px 40px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 15px; letter-spacing: 0.5px; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);">
                Track Your ITR Status →
              </a>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #ffffff; padding: 20px 28px; border-bottom: 1px solid #e2e8f0; border-left: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; border-radius: 0 0 16px 16px; text-align: center;">
            <div style="display: inline-flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <div style="background: linear-gradient(135deg, #1e3a5f, #2563eb); padding: 5px 10px; border-radius: 6px;">
                <span style="color: white; font-weight: 800; font-size: 9px; letter-spacing: 0.5px;">TMI</span>
              </div>
              <span style="color: #1e293b; font-weight: 700; font-size: 13px;">TaxMattersIndia</span>
            </div>
            <p style="margin: 0; color: #94a3b8; font-size: 12px; line-height: 1.5;">
              Your trusted partner for Income Tax Return filing.<br/>
              This is an automated email from the ITR Filing Portal. Please do not reply.
            </p>
          </div>
        </div>
      `,
    })
    console.log(`Email sent successfully to ${toEmail}`, mailResult.messageId)
    return true
  } catch (error) {
    console.error('[EMAIL] Failed to send email to', toEmail, ':', error)
    return false
  }
}