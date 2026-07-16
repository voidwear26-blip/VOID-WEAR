'use server';

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * UPLINK TRANSMISSION: Contact Form Relay
 * Relays message data from support@voidwear.co.in
 */
export async function sendContactEmail(prevState: any, formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const subject = formData.get('subject') as string;
  const message = formData.get('message') as string;

  if (!name || !email || !subject || !message) {
    return { success: false, message: 'MISSING_DATA_NODES' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'VOID WEAR | SUPPORT <support@voidwear.co.in>',
      to: 'voidwear26@gmail.com',
      replyTo: email,
      subject: `[UPLINK_INCOMING] ${subject.toUpperCase()}`,
      html: `
        <div style="background-color: #000; color: #fff; padding: 50px; font-family: 'Helvetica', sans-serif; border: 1px solid #222;">
          <div style="border-left: 4px solid #fff; padding-left: 20px; margin-bottom: 40px;">
            <h1 style="color: #fff; font-size: 20px; letter-spacing: 0.4em; text-transform: uppercase; margin: 0;">INCOMING_TRANSMISSION</h1>
            <p style="color: #555; font-size: 10px; letter-spacing: 0.2em; margin-top: 5px;">SOURCE: USER_UPLINK</p>
          </div>
          
          <div style="margin-bottom: 40px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="color: #444; font-size: 9px; text-transform: uppercase; padding: 10px 0; letter-spacing: 0.2em;">ENTITY_NAME</td>
                <td style="color: #fff; font-size: 12px; text-transform: uppercase; padding: 10px 0; font-weight: bold;">${name}</td>
              </tr>
              <tr>
                <td style="color: #444; font-size: 9px; text-transform: uppercase; padding: 10px 0; letter-spacing: 0.2em;">CONTACT_REF</td>
                <td style="color: #fff; font-size: 12px; padding: 10px 0; font-weight: bold;">${email}</td>
              </tr>
              <tr>
                <td style="color: #444; font-size: 9px; text-transform: uppercase; padding: 10px 0; letter-spacing: 0.2em;">SUBJECT_LINE</td>
                <td style="color: #fff; font-size: 12px; text-transform: uppercase; padding: 10px 0; font-weight: bold;">${subject}</td>
              </tr>
            </table>
          </div>

          <div style="background-color: #050505; border: 1px solid #111; padding: 30px;">
            <p style="color: #444; font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 15px;">MESSAGE_BODY</p>
            <p style="white-space: pre-wrap; font-size: 14px; line-height: 1.8; color: #888; text-transform: uppercase; font-family: monospace;">${message}</p>
          </div>

          <div style="margin-top: 60px; text-align: center; border-top: 1px solid #111; pt-30px;">
            <p style="font-size: 8px; color: #222; letter-spacing: 0.8em; text-transform: uppercase; margin-top: 30px;">
              SYSTEM_MANIFESTO_2026 // SECURE_UPLINK
            </p>
          </div>
        </div>
      `
    });

    if (error) {
      console.error('[UPLINK_FAILURE] Resend error:', error);
      return { success: false, message: 'UPLINK_RELAY_ERROR' };
    }

    return { success: true, message: 'TRANSMISSION_SECURED' };
  } catch (error: any) {
    console.error('[UPLINK_FAILURE] Critical crash:', error);
    return { success: false, message: 'UPLINK_SERVER_ERROR' };
  }
}
