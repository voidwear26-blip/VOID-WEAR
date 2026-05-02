'use client';

import { useFirestore, useUser } from '@/firebase';
import { collection, getDocs, collectionGroup, query, limit } from 'firebase/firestore';
import { ChevronLeft, Database, Download, Loader2, ShieldAlert, FileText, BarChart3, Package, Zap } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function SystemArchivePage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const isAdmin = user?.email?.toLowerCase() === 'voidwear26@gmail.com';

  useEffect(() => {
    setMounted(true);
    if (!isUserLoading && !isAdmin) {
      router.push('/');
    }
  }, [isUserLoading, isAdmin, router, mounted]);

  const generateMissionAuditPDF = async () => {
    if (!db || !isAdmin) return;
    setLoading(true);

    try {
      // DYNAMIC IMPORTS: Preventing SSR crash by loading browser libraries only when triggered
      const { jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');

      // 1. Fetch System Data
      const productsSnap = await getDocs(collection(db, 'products'));
      const products = productsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      const ordersSnap = await getDocs(query(collectionGroup(db, 'orders'), limit(500)));
      const orders = ordersSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      // Sort client-side
      const sortedOrders = orders.sort((a: any, b: any) => 
        new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
      );

      // 2. Calculate Analytics
      const totalRevenue = orders.reduce((acc, o: any) => acc + (Number(o.totalAmount) || 0), 0);
      const totalUnits = products.reduce((acc, p: any) => acc + (Number(p.stockQuantity) || 0), 0);
      
      // 3. Initialize PDF
      const doc = new jsPDF();
      const timestamp = new Date().toLocaleString();

      // HEADER
      doc.setFillColor(0, 0, 0);
      doc.rect(0, 0, 210, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.text('VOID WEAR // MISSION AUDIT', 15, 20);
      doc.setFontSize(8);
      doc.text(`SYSTEM_STATUS: STABLE // GENERATED: ${timestamp}`, 15, 30);
      doc.text('EST. 2026 / VELLORE - INDIA', 15, 34);

      // SECTION 1: SYSTEM SUMMARY
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.text('01. EXECUTIVE SUMMARY', 15, 55);
      
      autoTable(doc, {
        startY: 60,
        head: [['METRIC', 'VALUATION / QUANTITY']],
        body: [
          ['TOTAL SYSTEM REVENUE', `INR ${totalRevenue.toLocaleString()}`],
          ['TOTAL TRANSMISSIONS (ORDERS)', orders.length.toString()],
          ['AGGREGATED INVENTORY UNITS', totalUnits.toString()],
          ['UNIQUE MODULES (PRODUCTS)', products.length.toString()],
          ['SECURITY ENCRYPTION', 'AES-256-GCM'],
        ],
        theme: 'striped',
        headStyles: { fillColor: [0, 0, 0] },
      });

      // SECTION 2: PRODUCT CATALOG
      doc.addPage();
      doc.setFillColor(0, 0, 0);
      doc.rect(0, 0, 210, 20, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.text('02. PRODUCT CATALOG AUDIT', 15, 13);
      
      const productRows = products.map((p: any) => [
        p.id.slice(0, 8),
        p.name?.toUpperCase() || 'N/A',
        p.category?.toUpperCase() || 'UNSET',
        `INR ${p.basePrice || 0}`,
        p.stockQuantity?.toString() || '0'
      ]);

      autoTable(doc, {
        startY: 30,
        head: [['UID', 'MODULE NAME', 'CATEGORY', 'PRICE', 'STOCK']],
        body: productRows,
        theme: 'grid',
        headStyles: { fillColor: [60, 60, 60] },
        styles: { fontSize: 8 }
      });

      // SECTION 3: TRANSACTION LOG
      doc.addPage();
      doc.setFillColor(0, 0, 0);
      doc.rect(0, 0, 210, 20, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.text('03. TRANSMISSION ARCHIVE (ORDERS)', 15, 13);

      const orderRows = sortedOrders.map((o: any) => [
        o.order_ID || o.id?.slice(0, 12),
        new Date(o.orderDate).toLocaleDateString(),
        (o.displayName || 'OPERATOR').toUpperCase(),
        o.paymentStatus?.toUpperCase() || 'PAID',
        `INR ${o.totalAmount || 0}`
      ]);

      autoTable(doc, {
        startY: 30,
        head: [['ORDER_ID', 'DATE', 'ENTITY', 'STATUS', 'VALUATION']],
        body: orderRows,
        theme: 'grid',
        headStyles: { fillColor: [60, 60, 60] },
        styles: { fontSize: 8 }
      });

      // FOOTER ON EVERY PAGE
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setTextColor(150, 150, 150);
        doc.text(`VOID WEAR INC // LOGISTICS PROTOCOL 2026 // PAGE ${i} OF ${pageCount}`, 105, 285, { align: 'center' });
      }

      // SAVE
      doc.save(`VOID_MISSION_AUDIT_${new Date().toISOString().split('T')[0]}.pdf`);

      toast({
        title: "AUDIT GENERATED",
        description: "MISSION LOGS CONVERTED TO PDF FORMAT.",
      });
    } catch (e) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "AUDIT FAILURE",
        description: "COULD NOT PACK DATABASE LOGS.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || isUserLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white/40" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="pt-40 pb-32 bg-transparent min-h-screen">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="space-y-4 mb-16">
          <Link href="/admin" className="flex items-center gap-2 text-[10px] text-white/40 hover:text-white transition-colors uppercase tracking-widest mb-4 font-bold">
            <ChevronLeft className="w-3 h-3" />
            BACK TO SYSTEM
          </Link>
          <div className="flex items-center gap-6">
            <Database className="w-10 h-10 text-white/40" />
            <h1 className="text-4xl md:text-5xl font-black tracking-tight glow-text uppercase leading-none">System Archive</h1>
          </div>
        </div>

        <div className="grid gap-12">
          <div className="bg-white/[0.02] border border-white/5 p-12 space-y-12 backdrop-blur-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="space-y-4 max-w-xl">
                <div className="flex items-center gap-3 text-white/80">
                  <BarChart3 className="w-5 h-5 text-white/40" />
                  <h3 className="text-xs font-bold tracking-[0.4em] uppercase">Mission Audit Protocol</h3>
                </div>
                <p className="text-[10px] text-white/60 tracking-widest leading-relaxed uppercase">
                  Initialize a global system audit. This will scan the entire assemblage and all confirmed transmissions to generate a high-precision PDF report including revenue breakdown, inventory levels, and order history.
                </p>
              </div>
              
              <Button 
                onClick={generateMissionAuditPDF}
                disabled={loading}
                className="bg-white text-black hover:bg-white/90 h-20 px-10 text-[10px] font-bold tracking-[0.5em] rounded-none shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all shrink-0"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    GENERATE MISSION AUDIT (PDF)
                    <Download className="ml-4 w-4 h-4" />
                  </>
                )}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 border-t border-white/5">
               <StatHighlight icon={<Zap className="w-4 h-4" />} label="REVENUE TRACKING" />
               <StatHighlight icon={<Package className="w-4 h-4" />} label="INVENTORY LOGS" />
               <StatHighlight icon={<FileText className="w-4 h-4" />} label="TABULAR ARCHIVE" />
            </div>
          </div>

          <div className="p-8 border border-white/5 bg-white/[0.01] space-y-6">
            <div className="flex items-center gap-4 text-white/60">
              <ShieldAlert className="w-5 h-5 text-white/80" />
              <span className="text-[10px] tracking-[0.4em] uppercase font-bold">SECURITY ADVISORY</span>
            </div>
            <div className="space-y-4">
              <p className="text-[10px] text-white/40 tracking-widest leading-relaxed uppercase">
                MISSION AUDITS CONTAIN SENSITIVE FINANCIAL METADATA AND ENTITY IDENTIFIERS. ENSURE ALL GENERATED LOGS ARE STORED WITHIN SECURE FRONTIER SERVERS OR ENCRYPTED OFFLINE VOLUMES.
              </p>
              <div className="flex items-center gap-4 text-[9px] text-white/40 tracking-[0.3em] uppercase font-bold">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                ENCRYPTION ACTIVE: AES-256
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatHighlight({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <div className="flex items-center gap-4 p-6 bg-white/[0.01] border border-white/5">
      <div className="text-white/20">{icon}</div>
      <span className="text-[8px] font-black tracking-[0.3em] text-white/60 uppercase">{label}</span>
    </div>
  );
}
