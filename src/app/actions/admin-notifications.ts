'use server';

import { Resend } from 'resend';

const resend = new Resend('re_43Qt9Sqs_KMkjukPTvcYxkFEmCsLXwhzC');

/**
 * ADMIN NOTIFICATION RELAY
 * Dispatches a high-priority alert to the admin via Resend upon order completion.
 */
export async function sendAdminOrderNotification(orderData: any) {
  const adminEmail = 'voidwear26@gmail.com';

  try {
    const itemsSummary = orderData.items.map((item: any) => 
      `- ${item.name} (SIZE: ${item.size}, QTY: ${item.quantity})`
    ).join('\n');

    await resend.emails.send({
      from: 'VOID WEAR SYSTEM <onboarding@resend.dev>',
      to: adminEmail,
      subject: `[NEW_ORDER] ${orderData.order_ID}`,
      html: `
        <div style="background-color: #000; color: #fff; padding: 40px; font-family: 'Space Grotesk', sans-serif; border: 1px solid #333;">
          <h1 style="border-bottom: 1px solid #333; padding-bottom: 20px; font-size: 20px; letter-spacing: 0.3em; text-transform: uppercase;">NEW ORDER RECEIVED</h1>
          <div style="margin-top: 30px;">
            <p style="color: #666; font-size: 10px; letter-spacing: 0.1em; margin-bottom: 5px; text-transform: uppercase;">ORDER_ID</p>
            <p style="margin-bottom: 20px; font-size: 16px; font-weight: bold;">${orderData.order_ID}</p>
            
            <p style="color: #666; font-size: 10px; letter-spacing: 0.1em; margin-bottom: 5px; text-transform: uppercase;">VALUE</p>
            <p style="margin-bottom: 20px; font-size: 24px; color: #fff; font-weight: 900;">₹${orderData.totalAmount}</p>
            
            <p style="color: #666; font-size: 10px; letter-spacing: 0.1em; margin-bottom: 5px; text-transform: uppercase;">CUSTOMER</p>
            <p style="margin-bottom: 20px; font-size: 14px;">${orderData.displayName} / ${orderData.email}</p>
          </div>
          <div style="margin-top: 30px; border-top: 1px solid #333; padding-top: 20px;">
             <p style="color: #666; font-size: 10px; letter-spacing: 0.1em; margin-bottom: 10px; text-transform: uppercase;">ITEMS_SUMMARY</p>
             <pre style="font-size: 12px; line-height: 1.6; color: #ccc;">${itemsSummary}</pre>
          </div>
          <div style="margin-top: 40px; font-size: 8px; color: #444; letter-spacing: 0.5em; text-align: center; text-transform: uppercase;">
            VOID WEAR // SYSTEM COMMAND 2026
          </div>
        </div>
      `
    });

    return { success: true };
  } catch (error) {
    console.error('[NOTIFICATION_FAILURE] Resend failed:', error);
    return { success: false };
  }
}
