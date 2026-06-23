'use server';

import nodemailer from 'nodemailer';

/**
 * ADMIN NOTIFICATION RELAY
 * Dispatches a high-priority email to the admin upon successful order completion.
 */
export async function sendAdminOrderNotification(orderData: any) {
  const adminEmail = 'voidwear26@gmail.com';
  const appPassword = process.env.GMAIL_APP_PASSWORD;

  if (!appPassword) {
    console.error('[NOTIFICATION_FAILURE] GMAIL_APP_PASSWORD not configured.');
    return { success: false };
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: adminEmail,
        pass: appPassword,
      },
    });

    const itemsSummary = orderData.items.map((item: any) => 
      `- ${item.name} (SZ: ${item.size}, QTY: ${item.quantity})`
    ).join('\n');

    const mailOptions = {
      from: `"VOID WEAR SYSTEM" <${adminEmail}>`,
      to: adminEmail,
      subject: `[NEW_TRANSMISSION] ${orderData.order_ID}`,
      text: `
NEW ACQUISITION DETECTED

ORDER_ID: ${orderData.order_ID}
VALUATION: ₹${orderData.totalAmount}
ENTITY: ${orderData.displayName} (${orderData.email})
CONTACT: ${orderData.mobileNumber}

MODULES:
${itemsSummary}

DESTINATION:
${orderData.addressLine1}, ${orderData.city}, ${orderData.stateProvince}
      `,
      html: `
        <div style="background-color: #000; color: #fff; padding: 40px; font-family: 'Space Grotesk', sans-serif; border: 1px solid #333;">
          <h1 style="border-bottom: 1px solid #333; padding-bottom: 20px; font-size: 20px; letter-spacing: 0.3em; text-transform: uppercase;">NEW TRANSMISSION DETECTED</h1>
          <div style="margin-top: 30px;">
            <p style="color: #666; font-size: 10px; letter-spacing: 0.1em; margin-bottom: 5px; text-transform: uppercase;">ORDER_UID</p>
            <p style="margin-bottom: 20px; font-size: 16px; font-weight: bold;">${orderData.order_ID}</p>
            
            <p style="color: #666; font-size: 10px; letter-spacing: 0.1em; margin-bottom: 5px; text-transform: uppercase;">VALUATION</p>
            <p style="margin-bottom: 20px; font-size: 24px; color: #fff; font-weight: 900;">₹${orderData.totalAmount}</p>
            
            <p style="color: #666; font-size: 10px; letter-spacing: 0.1em; margin-bottom: 5px; text-transform: uppercase;">OPERATOR_IDENTITY</p>
            <p style="margin-bottom: 20px; font-size: 14px;">${orderData.displayName} / ${orderData.email}</p>
          </div>
          <div style="margin-top: 30px; border-top: 1px solid #333; padding-top: 20px;">
             <p style="color: #666; font-size: 10px; letter-spacing: 0.1em; margin-bottom: 10px; text-transform: uppercase;">MODULES_SUMMARY</p>
             <pre style="font-size: 12px; line-height: 1.6; color: #ccc;">${itemsSummary}</pre>
          </div>
          <div style="margin-top: 40px; font-size: 8px; color: #444; letter-spacing: 0.5em; text-align: center; text-transform: uppercase;">
            VOID WEAR // SYSTEM COMMAND 2026
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('[NOTIFICATION_FAILURE]', error);
    return { success: false };
  }
}
