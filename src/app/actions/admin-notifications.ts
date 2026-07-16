'use server';

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * ADMIN NOTIFICATION RELAY
 * Dispatches high-priority order alerts to admin via order@voidwear.co.in
 */
export async function sendAdminOrderNotification(orderData: any) {
  const adminEmail = 'voidwear26@gmail.com';

  try {
    const itemsSummary = orderData.items.map((item: any) => 
      `- ${item.name.toUpperCase()} (SIZE: ${item.size}, QTY: ${item.quantity})`
    ).join('\n');

    await resend.emails.send({
      from: 'VOID WEAR | SYSTEM <order@voidwear.co.in>',
      to: adminEmail,
      subject: `[SYSTEM_ALERT] NEW_ACQUISITION_${orderData.order_ID}`,
      html: `
        <div style="background-color: #000; color: #fff; padding: 40px; font-family: 'Helvetica', sans-serif; border: 1px solid #333;">
          <h1 style="border-bottom: 2px solid #fff; padding-bottom: 20px; font-size: 20px; letter-spacing: 0.4em; text-transform: uppercase;">NEW_ACQUISITION</h1>
          
          <div style="margin-top: 30px; display: grid; gap: 20px;">
            <div style="padding: 20px; background-color: #050505; border: 1px solid #111;">
              <p style="color: #444; font-size: 8px; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 5px;">ORDER_IDENTIFIER</p>
              <p style="font-size: 16px; font-weight: bold; margin: 0;">${orderData.order_ID}</p>
            </div>
            
            <div style="padding: 20px; background-color: #050505; border: 1px solid #111;">
              <p style="color: #444; font-size: 8px; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 5px;">CREDIT_VALUATION</p>
              <p style="font-size: 28px; color: #fff; font-weight: 900; margin: 0;">₹${orderData.totalAmount}</p>
            </div>
            
            <div style="padding: 20px; background-color: #050505; border: 1px solid #111;">
              <p style="color: #444; font-size: 8px; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 5px;">ENTITY_LINK</p>
              <p style="font-size: 14px; margin: 0; text-transform: uppercase;">${orderData.displayName} / ${orderData.email}</p>
            </div>
          </div>

          <div style="margin-top: 30px; border-top: 1px solid #333; padding-top: 20px;">
             <p style="color: #444; font-size: 8px; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 10px;">ASSEMBLAGE_DATA</p>
             <pre style="font-size: 12px; line-height: 1.6; color: #888;">${itemsSummary}</pre>
          </div>

          <div style="margin-top: 50px; font-size: 7px; color: #333; letter-spacing: 1em; text-align: center; text-transform: uppercase;">
            VOID WEAR // COMMAND_CENTER_2026
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
