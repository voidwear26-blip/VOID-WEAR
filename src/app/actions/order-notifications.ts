
'use server';

import { Resend } from 'resend';
import { generateNotificationContent } from '@/ai/flows/generate-notification-content';

const resend = new Resend('re_43Qt9Sqs_KMkjukPTvcYxkFEmCsLXwhzC');

/**
 * VOID WEAR // RESEND DUAL-RELAY
 * Dispatches order notifications via Resend to both Admin and Customer.
 * Enhanced with isolated error handling to prevent transmission blocks.
 */
export async function sendOrderConfirmationNotifications(orderData: any) {
  const adminEmail = 'voidwear26@gmail.com';
  const customerEmail = orderData.email;

  try {
    let emailBody = "YOUR ORDER HAS BEEN SECURED IN THE VOID WEAR ARCHIVE.";
    try {
      const neuralContent = await generateNotificationContent({
        productName: orderData.items?.[0]?.name || 'APPAREL MODULE',
        status: 'confirmed',
        operatorName: orderData.displayName || 'CUSTOMER'
      });
      emailBody = neuralContent.emailContent;
    } catch (aiErr) {
      console.warn('[AI_CONTENT_GEN_FAIL] Falling back to system template.', aiErr);
    }

    const itemsSummary = orderData.items.map((item: any) => 
      `- ${item.name} (SIZE: ${item.size}, QTY: ${item.quantity})`
    ).join('\n');

    // 2. Customer Confirmation Relay (Isolated Try-Catch)
    const relayCustomerMail = async () => {
      try {
        await resend.emails.send({
          from: 'VOID WEAR <onboarding@resend.dev>',
          to: customerEmail,
          subject: `[ORDER_CONFIRMED] ${orderData.order_ID}`,
          html: `
            <div style="background-color: #f9f9f9; color: #000; padding: 40px; font-family: 'Space Grotesk', sans-serif; border: 1px solid #eee;">
              <h1 style="border-bottom: 1px solid #eee; padding-bottom: 20px; font-size: 20px; letter-spacing: 0.3em; text-transform: uppercase;">ORDER SECURED</h1>
              <div style="margin-top: 30px;">
                <p style="color: #666; font-size: 10px; letter-spacing: 0.1em; margin-bottom: 5px; text-transform: uppercase;">STATUS_UPDATE</p>
                <p style="font-size: 14px; line-height: 1.6; color: #333;">${emailBody}</p>
              </div>
              <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
                 <p style="color: #666; font-size: 10px; letter-spacing: 0.1em; margin-bottom: 10px; text-transform: uppercase;">ORDER_SUMMARY</p>
                 <pre style="font-size: 12px; line-height: 1.6; color: #000; font-family: monospace;">${itemsSummary}</pre>
              </div>
              <div style="margin-top: 40px; font-size: 8px; color: #999; letter-spacing: 0.5em; text-align: center; text-transform: uppercase;">
                VOID WEAR // 2026
              </div>
            </div>
          `
        });
      } catch (err) {
        console.error('[CUSTOMER_RELAY_FAILURE]', err);
      }
    };

    // 3. System Command Alert (Admin Relay - Isolated Try-Catch)
    const relayAdminMail = async () => {
      try {
        await resend.emails.send({
          from: 'VOID WEAR SYSTEM <onboarding@resend.dev>',
          to: adminEmail,
          subject: `[NEW_ORDER] ${orderData.order_ID}`,
          html: `
            <div style="background-color: #000; color: #fff; padding: 40px; font-family: 'Space Grotesk', sans-serif; border: 1px solid #333;">
              <h1 style="border-bottom: 1px solid #333; padding-bottom: 20px; font-size: 20px; letter-spacing: 0.3em; text-transform: uppercase;">NEW ORDER DETECTED</h1>
              <div style="margin-top: 30px;">
                <p style="color: #666; font-size: 10px; letter-spacing: 0.1em; margin-bottom: 5px; text-transform: uppercase;">ORDER_ID</p>
                <p style="margin-bottom: 20px; font-size: 16px; font-weight: bold;">${orderData.order_ID}</p>
                
                <p style="color: #666; font-size: 10px; letter-spacing: 0.1em; margin-bottom: 5px; text-transform: uppercase;">VALUE</p>
                <p style="margin-bottom: 20px; font-size: 24px; color: #fff; font-weight: 900;">₹${orderData.totalAmount}</p>
                
                <p style="color: #666; font-size: 10px; letter-spacing: 0.1em; margin-bottom: 5px; text-transform: uppercase;">CUSTOMER_IDENTITY</p>
                <p style="margin-bottom: 20px; font-size: 14px;">${orderData.displayName} / ${orderData.email}</p>
              </div>
              <div style="margin-top: 30px; border-top: 1px solid #333; padding-top: 20px;">
                 <p style="color: #666; font-size: 10px; letter-spacing: 0.1em; margin-bottom: 10px; text-transform: uppercase;">ITEM_SUMMARY</p>
                 <pre style="font-size: 12px; line-height: 1.6; color: #ccc;">${itemsSummary}</pre>
              </div>
              <div style="margin-top: 40px; font-size: 8px; color: #444; letter-spacing: 0.5em; text-align: center; text-transform: uppercase;">
                VOID WEAR // SYSTEM COMMAND 2026
              </div>
            </div>
          `
        });
      } catch (err) {
        console.error('[ADMIN_RELAY_FAILURE]', err);
      }
    };

    // Execute relays concurrently
    await Promise.allSettled([relayCustomerMail(), relayAdminMail()]);

    return { success: true };
  } catch (error) {
    console.error('[ORDER_NOTIFICATION_FAILURE] System relay failed:', error);
    return { success: false, error: 'RELAY_FAILURE' };
  }
}
