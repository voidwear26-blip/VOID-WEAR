'use server';

import { Resend } from 'resend';
import { generateNotificationContent } from '@/ai/flows/generate-notification-content';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * VOID WEAR // TRANSACTIONAL RELAY
 * Dispatches high-fidelity order notifications from order@voidwear.co.in
 */
export async function sendOrderConfirmationNotifications(orderData: any) {
  const adminEmail = 'voidwear26@gmail.com';
  const customerEmail = orderData.email;

  try {
    let emailBody = "YOUR ORDER HAS BEEN CONFIRMED AND IS NOW BEING PROCESSED.";
    try {
      const neuralContent = await generateNotificationContent({
        productName: orderData.items?.[0]?.name || 'PRODUCT ITEM',
        status: 'confirmed',
        operatorName: orderData.displayName || 'CUSTOMER'
      });
      emailBody = neuralContent.emailContent;
    } catch (aiErr) {
      console.warn('[AI_CONTENT_FAIL] Falling back to default template.', aiErr);
    }

    const itemsSummary = orderData.items.map((item: any) => 
      `<div style="display: flex; justify-content: space-between; border-bottom: 1px solid #eee; padding: 10px 0;">
        <span style="font-size: 10px; font-weight: bold; text-transform: uppercase;">${item.name} (${item.size}) x${item.quantity}</span>
        <span style="font-size: 10px; font-weight: bold;">₹${item.price * item.quantity}</span>
      </div>`
    ).join('');

    // 1. Customer Confirmation (Clean/Light Template)
    const relayCustomerMail = async () => {
      try {
        await resend.emails.send({
          from: 'VOID WEAR | ORDER <order@voidwear.co.in>',
          to: customerEmail,
          subject: `CONFIRMED: ${orderData.order_ID}`,
          html: `
            <div style="background-color: #ffffff; color: #000; padding: 60px 40px; font-family: 'Helvetica', sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee;">
              <div style="text-align: center; margin-bottom: 40px;">
                <h2 style="letter-spacing: 0.8em; font-size: 12px; margin: 0; color: #999;">VOID WEAR</h2>
              </div>
              <h1 style="font-size: 24px; letter-spacing: 0.3em; text-transform: uppercase; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 20px;">ORDER_SECURED</h1>
              
              <div style="margin-bottom: 40px;">
                <p style="font-size: 10px; letter-spacing: 0.1em; color: #666; text-transform: uppercase; margin-bottom: 5px;">STATUS: STABLE</p>
                <p style="font-size: 13px; line-height: 1.8; color: #333; text-transform: uppercase;">${emailBody}</p>
              </div>

              <div style="background-color: #f9f9f9; padding: 30px; margin-bottom: 40px;">
                <p style="font-size: 9px; letter-spacing: 0.2em; color: #999; text-transform: uppercase; margin-bottom: 20px;">ASSEMBLAGE_SUMMARY</p>
                ${itemsSummary}
                <div style="display: flex; justify-content: space-between; margin-top: 20px; font-weight: 900;">
                  <span style="font-size: 12px; text-transform: uppercase;">TOTAL_VALUATION</span>
                  <span style="font-size: 14px;">₹${orderData.totalAmount}</span>
                </div>
              </div>

              <div style="text-align: center; border-top: 1px solid #eee; pt-30px; margin-top: 50px;">
                <p style="font-size: 8px; color: #ccc; letter-spacing: 0.5em; text-transform: uppercase; margin-top: 30px;">
                  EST. 2026 // VELLORE - INDIA
                </p>
              </div>
            </div>
          `
        });
      } catch (err) {
        console.error('[CUSTOMER_MAIL_FAILURE]', err);
      }
    };

    // 2. Admin Alert (System/Dark Template)
    const relayAdminMail = async () => {
      try {
        await resend.emails.send({
          from: 'VOID WEAR | SYSTEM <order@voidwear.co.in>',
          to: adminEmail,
          subject: `[ACQUISITION_ALERT] ${orderData.order_ID}`,
          html: `
            <div style="background-color: #000; color: #fff; padding: 40px; font-family: 'Courier New', monospace; border: 1px solid #333;">
              <h1 style="border-bottom: 1px solid #333; padding-bottom: 20px; font-size: 18px; letter-spacing: 0.3em; text-transform: uppercase; color: #fff;">NEW_ORDER_DETECTED</h1>
              <div style="margin-top: 30px;">
                <p style="color: #666; font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase;">ID: ${orderData.order_ID}</p>
                <p style="color: #666; font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase;">VALUE: ₹${orderData.totalAmount}</p>
                <p style="color: #666; font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase;">CUSTOMER: ${orderData.displayName} (${orderData.email})</p>
              </div>
              <div style="margin-top: 30px; border-top: 1px solid #333; padding-top: 20px;">
                 <p style="color: #00ff00; font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase;">TRANSACTION_VERIFIED</p>
              </div>
            </div>
          `
        });
      } catch (err) {
        console.error('[ADMIN_MAIL_FAILURE]', err);
      }
    };

    await Promise.allSettled([relayCustomerMail(), relayAdminMail()]);
    return { success: true };
  } catch (error) {
    console.error('[NOTIFICATION_ERROR]', error);
    return { success: false, error: 'MAIL_FAILURE' };
  }
}
