'use client';

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';

/**
 * VOID WEAR // INVOICE GENERATOR V2.1
 * Generates a cinematic 3.93x5.90 inch PDF transmission log with QR verification.
 * Optimized for Next.js client-side execution with robust error handling.
 */
export async function generateInvoicePDF(order: any) {
  if (!order || !order.items) {
    console.error('SYSTEM_ERROR: INVALID_TRANSMISSION_DATA');
    return;
  }

  // Dimensions: 3.93in x 5.90in = ~100mm x 150mm
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [100, 150]
  });

  const primaryColor = '#000000';
  const secondaryColor = '#666666';
  const accentColor = '#333333';

  try {
    // 1. Header / Branding
    doc.setFillColor(primaryColor);
    doc.rect(0, 0, 100, 25, 'F');
    
    doc.setTextColor('#FFFFFF');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('VOID WEAR', 10, 12);
    
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.text('SYSTEM MANIFESTO // TRANSMISSION LOG', 10, 17);
    doc.text('EST. 2026 / NEO-TOKYO', 10, 20);

    // 2. Order Metadata
    doc.setTextColor(primaryColor);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('TRANSMISSION_UID:', 10, 35);
    doc.setFont('helvetica', 'normal');
    doc.text((order.order_ID || order.id || 'INTERNAL').toString(), 40, 35);

    doc.setFont('helvetica', 'bold');
    doc.text('DATE:', 10, 40);
    doc.setFont('helvetica', 'normal');
    const displayDate = order.orderDate ? new Date(order.orderDate).toLocaleDateString() : new Date().toLocaleDateString();
    doc.text(displayDate, 40, 40);

    // 3. Entity Details
    doc.setDrawColor(accentColor);
    doc.line(10, 45, 90, 45);

    doc.setFont('helvetica', 'bold');
    doc.text('RECIPIENT:', 10, 52);
    doc.setFont('helvetica', 'normal');
    doc.text((order.displayName || 'UNIDENTIFIED OPERATOR').toUpperCase(), 10, 56);
    
    doc.setFontSize(6);
    doc.setTextColor(secondaryColor);
    const address = `${order.addressLine1 || 'N/A'}, ${order.city || ''}, ${order.stateProvince || ''} - ${order.postalCode || ''}`;
    const splitAddress = doc.splitTextToSize(address.toUpperCase(), 80);
    doc.text(splitAddress, 10, 60);

    doc.setFont('helvetica', 'bold');
    doc.text('UPLINK MODULE (MOBILE):', 10, 68);
    doc.setFont('helvetica', 'normal');
    doc.text((order.mobileNumber || 'NOT LOGGED').toString(), 45, 68);

    // 4. Module Table (Products)
    const tableData = order.items.map((item: any) => [
      (item.name || 'ASSEMBLAGE').toUpperCase(),
      (item.size || 'N/A').toString(),
      (item.quantity || 1).toString(),
      `INR ${item.price || 0}`
    ]);

    autoTable(doc, {
      startY: 75,
      head: [['MODULE', 'SZ', 'QTY', 'VAL']],
      body: tableData,
      theme: 'plain',
      styles: {
        fontSize: 6,
        cellPadding: 2,
        textColor: primaryColor,
        font: 'helvetica'
      },
      headStyles: {
        fillColor: primaryColor,
        textColor: '#FFFFFF',
        fontSize: 6,
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 10, halign: 'center' },
        2: { cellWidth: 10, halign: 'center' },
        3: { cellWidth: 20, halign: 'right' }
      }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;

    // 5. Total
    doc.setFillColor(primaryColor);
    doc.rect(55, finalY - 5, 35, 8, 'F');
    doc.setTextColor('#FFFFFF');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(`TOTAL: INR ${order.totalAmount || 0}`, 58, finalY);

    // 6. Security / QR Verification
    try {
      const qrPayload = JSON.stringify({
        uid: order.order_ID || order.id,
        val: order.totalAmount,
        auth: order.transition_ID || order.paymentProviderId || 'INTERNAL'
      });
      
      const qrCodeDataUrl = await QRCode.toDataURL(qrPayload, {
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      doc.addImage(qrCodeDataUrl, 'PNG', 75, 125, 18, 18);
      doc.setTextColor(secondaryColor);
      doc.setFontSize(5);
      doc.text('SCAN TO VERIFY TRANSMISSION', 68, 145);
    } catch (err) {
      console.warn('QR_GEN_FAILURE: PROCEEDING_WITHOUT_NEURAL_KEY');
    }

    // 7. Footer / Compliance
    doc.setTextColor(secondaryColor);
    doc.setFontSize(5);
    doc.setFont('helvetica', 'italic');
    doc.text('THIS IS A SECURE DIGITAL TRANSMISSION LOG. ALL RIGHTS RESERVED.', 10, 140);
    doc.text('VOID WEAR INC // LOGISTICS PROTOCOL 2026', 10, 143);

    // 8. Save Protocol
    const fileName = `VOID_INVOICE_${order.order_ID || order.id || Date.now()}.pdf`;
    doc.save(fileName);
    
  } catch (error) {
    console.error('CRITICAL_PDF_FAILURE:', error);
  }
}
