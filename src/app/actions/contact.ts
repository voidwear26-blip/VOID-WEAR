'use server';

import { Resend } from 'resend';

const resend = new Resend('re_43Qt9Sqs_KMkjukPTvcYxkFEmCsLXwhzC');

/**
 * UPLINK TRANSMISSION: Contact Form Action
 * Relays message data to the primary administrator via Resend.
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
    /**
     * TRANSMISSION PROTOCOL:
     * Using Resend for high-reliability message delivery.
     */
    const { data, error } = await resend.emails.send({
      from: 'VOID WEAR UPLINK <onboarding@resend.dev>',
      to: 'voidwear26@gmail.com',
      replyTo: email,
      subject: `[VOID_WEAR_UPLINK] ${subject.toUpperCase()}`,
      html: `
        <div style="background-color: #000; color: #fff; padding: 40px; font-family: 'Helvetica', sans-serif; border: 1px solid #333;">
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
