'use client';

import { useFirestore, useUser, useMemoFirebase, useDoc } from '@/firebase';
import { collection, getDocs, collectionGroup, query, limit, doc } from 'firebase/firestore';
import { ChevronLeft, Database, Download, Loader2, ShieldAlert, FileText, BarChart3, Package, Zap } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function SystemArchivePage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const profileRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(profileRef);

  const isAdmin = useMemo(() => {
    if (isUserLoading || !user) return false;
    return user.email?.toLowerCase() === 'voidwear26@gmail.com' || 
           user.uid === 'A9vsqn10oddfmouKiKjWpTcFqZB2' ||
           profile?.role === 'ADMIN';
  }, [user, isUserLoading, profile]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const generateMissionAuditPDF = async () => {
    if (!db || !isAdmin) return;
    setLoading(true);

    try {
      const { jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');

      const productsSnap = await getDocs(collection(db, 'products'));
      const products = productsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      const ordersSnap = await getDocs(query(collectionGroup(db, 'orders'), limit(500)));
      const orders = ordersSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      const totalRevenue = orders.reduce((acc, o: any) => acc + (Number(o.totalAmount) || 0), 0);
      const totalUnits = products.reduce((acc, p: any) => acc + (Number(p.stockQuantity) || 0), 0);
      
      const docPDF = new jsPDF();
      const timestamp = new Date().toLocaleString();

      docPDF.setFillColor(0, 0, 0);
      docPDF.rect(0, 0, 210, 40, 'F');
      docPDF.setTextColor(255, 255, 255);
      docPDF.setFontSize(22);
      docPDF.text('VOID WEAR // SYSTEM REPORT', 15, 20);
      docPDF.setFontSize(8);
      docPDF.text(`STATUS: STABLE // GENERATED: ${timestamp}`, 15, 30);
      docPDF.text('EST. 2026 / VELLORE - INDIA', 15, 34);

      autoTable(docPDF, {
        startY: 50,
        head: [['METRIC', 'VALUE']],
        body: [
          ['TOTAL REVENUE', `INR ${totalRevenue.toLocaleString()}`],
          ['TOTAL ORDERS', orders.length.toString()],
          ['TOTAL STOCK UNITS', totalUnits.toString()],
          ['UNIQUE PRODUCTS', products.length.toString()],
        ],
        theme: 'striped',
        headStyles: { fillColor: [0, 0, 0] },
      });

      docPDF.save(`VOID_SYSTEM_REPORT_${new Date().toISOString().split('T')[0]}.pdf`);
      toast({ title: "REPORT GENERATED" });
    } catch (e) {
      toast({ variant: "destructive", title: "GENERATE FAILURE" });
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || isUserLoading || isProfileLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-black/20" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="pt-40 pb-32 bg-transparent min-h-screen text-black font-body">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="space-y-4 mb-16">
          <Link href="/admin" className="flex items-center gap-2 text-[10px] text-black/60 hover:text-black transition-colors uppercase tracking-widest mb-4 font-bold">
            <ChevronLeft className="w-3 h-3" />
            BACK TO DASHBOARD
          </Link>
          <div className="flex items-center gap-6">
            <Database className="w-10 h-10 text-black/20" />
            <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase leading-none font-headline">System Archive</h1>
          </div>
        </div>

        <div className="grid gap-12">
          <div className="bg-black/[0.01] border border-black/5 p-12 space-y-12 backdrop-blur-xl shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="space-y-4 max-w-xl">
                <div className="flex items-center gap-3 text-black/80">
                  <BarChart3 className="w-5 h-5 text-black/40" />
                  <h3 className="text-xs font-bold tracking-[0.4em] uppercase">Data Export Protocol</h3>
                </div>
                <p className="text-[10px] text-black/60 tracking-widest leading-relaxed uppercase">
                  Generate a comprehensive PDF report of all system activities, including inventory status and sales records.
                </p>
              </div>
              
              <Button 
                onClick={generateMissionAuditPDF}
                disabled={loading}
                className="bg-black text-white hover:bg-black/90 h-20 px-10 text-[10px] font-bold tracking-[0.5em] rounded-none shadow-sm transition-all shrink-0"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    GENERATE REPORT (PDF)
                    <Download className="ml-4 w-4 h-4" />
                  </>
                )}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 border-t border-black/10">
               <StatHighlight icon={<Zap className="w-4 h-4" />} label="REVENUE LOGS" />
               <StatHighlight icon={<Package className="w-4 h-4" />} label="STOCK DATA" />
               <StatHighlight icon={<FileText className="w-4 h-4" />} label="PDF EXPORT" />
            </div>
          </div>

          <div className="p-8 border border-black/5 bg-black/[0.01] space-y-6">
            <div className="flex items-center gap-4 text-black/60">
              <ShieldAlert className="w-5 h-5 text-black/40" />
              <span className="text-[10px] tracking-[0.4em] uppercase font-bold">SECURITY ADVISORY</span>
            </div>
            <p className="text-[10px] text-black/60 tracking-widest leading-relaxed uppercase">
              System reports contain sensitive commercial data. Handle all exported logs with care and ensure they are stored securely.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatHighlight({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <div className="flex items-center gap-4 p-6 bg-black/[0.02] border border-black/5">
      <div className="text-black/40">{icon}</div>
      <span className="text-[8px] font-black tracking-[0.3em] text-black/60 uppercase">{label}</span>
    </div>
  );
}
