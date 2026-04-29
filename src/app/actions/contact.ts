'use server';

import nodemailer from 'nodemailer';

/**
 * UPLINK TRANSMISSION: Contact Form Action
 * Relays message data to the primary administrator via SMTP.
 */
export async function sendContactEmail(prevState: any, formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const subject = formData.get('subject') as string;
  const message = formData.get('message') as string;

  if (!name || !email || !subject || !message) {
    return { success: false, message: 'MISSING_DATA_NODES' };
  }

  const appPassword = process.env.GMAIL_APP_PASSWORD;

  if (!appPassword) {
    console.error('[UPLINK_FAILURE] GMAIL_APP_PASSWORD is not configured in environment.');
    return { success: false, message: 'SYSTEM_CONFIG_ERROR' };
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'voidwear26@gmail.com',
        pass: appPassword,
      },
    });

    /**
     * TRANSMISSION PROTOCOL:
     * We send FROM the authenticated user to avoid spoofing rejections.
     * We set replyTo to the operator's email so the admin can respond directly.
     */
    const mailOptions = {
      from: `"VOID WEAR UPLINK" <voidwear26@gmail.com>`,
      to: 'voidwear26@gmail.com',
      replyTo: email,
      subject: `[VOID_WEAR_UPLINK] ${subject.toUpperCase()}`,
      text: `
ENTITY IDENTITY: ${name}
CONTACT CHANNEL: ${email}
TOPIC: ${subject}

TRANSMISSION CONTENT:
${message}
      `,
      html: `
        <div style="background-color: #00; color: #fff; padding: 40px; font-family: 'Helvetica', sans-serif; border: 1px solid #333;">
          <h1 style="color: #fff; border-bottom: 1px solid #333; padding-bottom: 20px; font-size: 20px; letter-spacing: 0.2em; text-transform: uppercase;">INCOMING TRANSMISSION</h1>
          <div style="margin-top: 20px;">
            <p style="color: #666; font-size: 10px; letter-spacing: 0.1em; margin-bottom: 5px; text-transform: uppercase;">ENTITY_NAME</p>
            <p style="margin-bottom: 20px; font-size: 14px; color: #fff; text-transform: uppercase;">${name}</p>
            
            <p style="color: #666; font-size: 10px; letter-spacing: 0.1em; margin-bottom: 5px; text-transform: uppercase;">CONTACT_UPLINK</p>
            <p style="margin-bottom: 20px; font-size: 14px; color: #fff;">${email}</p>
            
            <p style="color: #666; font-size: 10px; letter-spacing: 0.1em; margin-bottom: 5px; text-transform: uppercase;">SUBJECT_LINE</p>
            <p style="margin-bottom: 20px; font-size: 14px; color: #fff; text-transform: uppercase;">${subject}</p>
          </div>
          <div style="margin-top: 30px; border-top: 1px solid #333; padding-top: 20px;">
            <p style="color: #666; font-size: 10px; letter-spacing: 0.1em; margin-bottom: 10px; text-transform: uppercase;">MESSAGE_BODY</p>
            <p style="white-space: pre-wrap; font-size: 14px; line-height: 1.6; color: #ccc; text-transform: uppercase;">${message}</p>
          </div>
          <div style="margin-top: 40px; font-size: 8px; color: #444; letter-spacing: 0.5em; text-align: center; text-transform: uppercase;">
            VOID WEAR // SYSTEM MANIFESTO 2026
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return { success: true, message: 'TRANSMISSION_SECURED' };
  } catch (error: any) {
    console.error('[UPLINK_FAILURE]', error);
    return { success: false, message: 'UPLINK_SERVER_ERROR' };
  }
}
