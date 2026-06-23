'use client';

/**
 * VOID WEAR // INVOICE GENERATOR V2.4
 * Generates a cinematic PDF transmission log.
 * Optimized for Next.js with dynamic imports to prevent SSR crashes.
 * Refinement: Removed system manifesto text and QR code nodes.
 */
export async function generateInvoicePDF(order: any) {
  if (!order || !order.items) {
    console.error('SYSTEM_ERROR: INVALID_TRANSMISSION_DATA');
    return;
  }

  // DYNAMIC IMPORTS: Shielding SSR from browser-only libraries
  const { jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

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

    const finalY = (doc as any).lastAutoTable.finalY + 10;

    // 5. Total
    doc.setFillColor(primaryColor);
    doc.rect(55, finalY - 5, 35, 8, 'F');
    doc.setTextColor('#FFFFFF');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(`TOTAL: INR ${order.totalAmount || 0}`, 58, finalY);

    // 6. Footer / Compliance
    doc.setTextColor(secondaryColor);
    doc.setFontSize(5);
    doc.setFont('helvetica', 'italic');
    doc.text('THIS IS A SECURE DIGITAL TRANSMISSION LOG. ALL RIGHTS RESERVED.', 10, 140);
    doc.text('VOID WEAR INC // LOGISTICS PROTOCOL 2026', 10, 143);

    // 7. Save Protocol
    const fileName = `VOID_INVOICE_${order.order_ID || order.id || Date.now()}.pdf`;
    doc.save(fileName);
    
  } catch (error) {
    console.error('CRITICAL_PDF_FAILURE:', error);
  }
}
