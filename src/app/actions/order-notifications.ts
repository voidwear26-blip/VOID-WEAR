'use server';

import { Resend } from 'resend';
import { generateNotificationContent } from '@/ai/flows/generate-notification-content';

const resend = new Resend('re_43Qt9Sqs_KMkjukPTvcYxkFEmCsLXwhzC');

/**
 * VOID WEAR // RESEND DUAL-UPLINK RELAY
 * Dispatches cinematic transmissions via Resend to both Admin and Operator.
 */
export async function sendOrderConfirmationNotifications(orderData: any) {
  const adminEmail = 'voidwear26@gmail.com';
  const customerEmail = orderData.email;

  try {
    // 1. Generate Neural Content for the Operator
    const neuralContent = await generateNotificationContent({
      productName: orderData.items?.[0]?.name || 'ASSEMBLAGE MODULE',
      status: 'confirmed',
      operatorName: orderData.displayName || 'OPERATOR'
    });

    const itemsSummary = orderData.items.map((item: any) => 
      `- ${item.name} (SZ: ${item.size}, QTY: ${item.quantity})`
    ).join('\n');

    // 2. TRANSMISSION A: Operator Confirmation (Customer)
    const customerMailPromise = resend.emails.send({
      from: 'VOID WEAR <onboarding@resend.dev>',
      to: customerEmail,
      subject: `[TRANSMISSION_SECURED] ${orderData.order_ID}`,
      html: `
        <div style="background-color: #000; color: #fff; padding: 40px; font-family: 'Space Grotesk', sans-serif; border: 1px solid #333;">
          <h1 style="border-bottom: 1px solid #333; padding-bottom: 20px; font-size: 20px; letter-spacing: 0.3em; text-transform: uppercase;">TRANSMISSION SECURED</h1>
          <div style="margin-top: 30px;">
            <p style="color: #666; font-size: 10px; letter-spacing: 0.1em; margin-bottom: 5px; text-transform: uppercase;">NEURAL_UPDATE</p>
            <p style="font-size: 14px; line-height: 1.6; color: #ccc;">${neuralContent.emailContent}</p>
          </div>
          <div style="margin-top: 30px; border-top: 1px solid #333; padding-top: 20px;">
             <p style="color: #666; font-size: 10px; letter-spacing: 0.1em; margin-bottom: 10px; text-transform: uppercase;">ACQUIRED_MODULES</p>
             <pre style="font-size: 12px; line-height: 1.6; color: #fff; font-family: monospace;">${itemsSummary}</pre>
          </div>
          <div style="margin-top: 30px; background-color: #111; padding: 20px; border-left: 2px solid #fff;">
             <p style="color: #666; font-size: 9px; letter-spacing: 0.1em; margin-bottom: 5px; text-transform: uppercase;">SYSTEM_ALERT</p>
             <p style="font-size: 11px; color: #fff; font-weight: bold;">${neuralContent.smsContent}</p>
          </div>
          <div style="margin-top: 40px; font-size: 8px; color: #444; letter-spacing: 0.5em; text-align: center; text-transform: uppercase;">
            VOID WEAR // SYSTEM MANIFESTO 2026
          </div>
        </div>
      `
    });

    // 3. TRANSMISSION B: System Alert (Admin)
    const adminMailPromise = resend.emails.send({
      from: 'VOID WEAR SYSTEM <onboarding@resend.dev>',
      to: adminEmail,
      subject: `[NEW_ACQUISITION] ${orderData.order_ID}`,
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
    });

    // Parallel Dispatch via Resend
    await Promise.all([customerMailPromise, adminMailPromise]);

    return { success: true };
  } catch (error) {
    console.error('[UPLINK_FAILURE] Resend transmission failed:', error);
    return { success: false };
  }
}
