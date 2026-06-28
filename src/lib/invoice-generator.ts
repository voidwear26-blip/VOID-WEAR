'use client';

/**
 * VOID WEAR // INVOICE GENERATOR V2.6
 * Generates a cinematic PDF transmission log.
 * Includes detailed financial breakdown with support for Free Shipping logic.
 */
export async function generateInvoicePDF(order: any) {
  if (!order || !order.items) {
    console.error('SYSTEM_ERROR: INVALID_TRANSMISSION_DATA');
    return;
  }

  const { jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [100, 160] 
  });

  const primaryColor = '#000000';
  const secondaryColor = '#666666';
  const accentColor = '#333333';

  try {
    // 1. Header / Branding
    doc.setFillColor(primaryColor);
    doc.rect(0, 0, 100, 32, 'F'); 
    
    doc.setTextColor('#FFFFFF');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('VOID WEAR', 10, 10);
    
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text('EMBRACE THE UNKNOWN', 10, 15); 
    
    doc.setFontSize(5);
    doc.text('GSTIN 27ABCDE1234F1Z5', 10, 20); 
    
    doc.setFontSize(6);
    doc.text('EST. 2026 /  VELLORE - INDIA', 10, 26);

    // 2. Order Metadata
    doc.setTextColor(primaryColor);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('TRANSMISSION_UID:', 10, 38);
    doc.setFont('helvetica', 'normal');
    doc.text((order.order_ID || order.id || 'INTERNAL').toString(), 40, 38);

    doc.setFont('helvetica', 'bold');
    doc.text('DATE:', 10, 43);
    doc.setFont('helvetica', 'normal');
    const displayDate = order.orderDate ? new Date(order.orderDate).toLocaleDateString() : new Date().toLocaleDateString();
    doc.text(displayDate, 40, 43);

    // 3. Entity Details
    doc.setDrawColor(accentColor);
    doc.line(10, 48, 90, 48);

    doc.setFont('helvetica', 'bold');
    doc.text('RECIPIENT:', 10, 55);
    doc.setFont('helvetica', 'normal');
    doc.text((order.displayName || 'UNIDENTIFIED OPERATOR').toUpperCase(), 10, 59);
    
    doc.setFontSize(6);
    doc.setTextColor(secondaryColor);
    const address = `${order.addressLine1 || 'N/A'}, ${order.city || ''}, ${order.stateProvince || ''} - ${order.postalCode || ''}`;
    const splitAddress = doc.splitTextToSize(address.toUpperCase(), 80);
    doc.text(splitAddress, 10, 63);

    doc.setFont('helvetica', 'bold');
    doc.text('UPLINK MODULE (MOBILE):', 10, 71);
    doc.setFont('helvetica', 'normal');
    doc.text((order.mobileNumber || 'REQUIRED_NODE_MISSING').toString(), 45, 71);

    // 4. Module Table (Products)
    const tableData = order.items.map((item: any) => [
      (item.name || 'ASSEMBLAGE').toUpperCase(),
      (item.size || 'N/A').toString(),
      (item.quantity || 1).toString(),
      `INR ${item.price || 0}`
    ]);

    autoTable(doc, {
      startY: 78,
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

    const tableFinalY = (doc as any).lastAutoTable.finalY;
    
    // Financial Breakdown Calculation
    const subtotal = order.subtotal || order.items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
    const tax = order.taxAmount || (subtotal * 0.05);
    const shipping = order.shippingFee !== undefined ? order.shippingFee : 0;
    const finalTotal = order.totalAmount || (subtotal + tax + shipping);

    // 5. Summary Lines
    doc.setFontSize(6);
    doc.setTextColor(secondaryColor);
    doc.setFont('helvetica', 'normal');
    
    doc.text('SUBTOTAL:', 60, tableFinalY + 6);
    doc.text(`INR ${subtotal.toFixed(2)}`, 90, tableFinalY + 6, { align: 'right' });
    
    doc.text('EST. TAX (5%):', 60, tableFinalY + 10);
    doc.text(`INR ${tax.toFixed(2)}`, 90, tableFinalY + 10, { align: 'right' });
    
    doc.text('SHIPPING FEE:', 60, tableFinalY + 14);
    const shippingText = shipping === 0 ? 'FREE' : `INR ${shipping.toFixed(2)}`;
    doc.text(shippingText, 90, tableFinalY + 14, { align: 'right' });

    // 6. Total Box
    doc.setFillColor(primaryColor);
    doc.rect(55, tableFinalY + 18, 35, 8, 'F');
    doc.setTextColor('#FFFFFF');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(`TOTAL: INR ${finalTotal.toFixed(2)}`, 58, tableFinalY + 23);

    // 7. Footer / Compliance
    doc.setTextColor(secondaryColor);
    doc.setFontSize(5);
    doc.setFont('helvetica', 'italic');
    doc.text('THIS IS A SECURE DIGITAL TRANSMISSION LOG. ALL RIGHTS RESERVED.', 10, 150);
    doc.text('VOID WEAR INC // LOGISTICS PROTOCOL 2026', 10, 153);

    // 8. Save Protocol
    const fileName = `VOID_INVOICE_${order.order_ID || order.id || Date.now()}.pdf`;
    doc.save(fileName);
    
  } catch (error) {
    console.error('CRITICAL_PDF_FAILURE:', error);
  }
}
