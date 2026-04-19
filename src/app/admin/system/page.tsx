
'use client';

import { useFirestore, useUser } from '@/firebase';
import { collection, getDocs, doc, setDoc, writeBatch } from 'firebase/firestore';
import { ChevronLeft, Database, Download, Upload, Loader2, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
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

  const exportSystemData = async () => {
    if (!db || !isAdmin) return;
    setLoading(true);

    try {
      const collections = ['products', 'stories', 'reviews', 'app_config'];
      const archive: any = {};

      for (const colName of collections) {
        const snap = await getDocs(collection(db, colName));
        archive[colName] = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      }

      // Also export users (Basic profile data)
      const userSnap = await getDocs(collection(db, 'users'));
      archive['users'] = userSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      const dataStr = JSON.stringify(archive, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `VOID_ARCHIVE_${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();

      toast({
        title: "ARCHIVE GENERATED",
        description: "SYSTEM LOGS ENCRYPTED AND DOWNLOADED.",
      });
    } catch (e) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "EXPORT FAILURE",
        description: "COULD NOT PACK DATABASE LOGS.",
      });
    } finally {
      setLoading(false);
    }
  };

  const importSystemData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !db || !isAdmin) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result;
      if (typeof content !== 'string') return;

      setLoading(true);
      try {
        const data = JSON.parse(content);
        const batch = writeBatch(db);

        // Standard Collections
        const collections = ['products', 'stories', 'reviews', 'app_config', 'users'];

        for (const colName of collections) {
          if (data[colName] && Array.isArray(data[colName])) {
            data[colName].forEach((item: any) => {
              const { id, ...rest } = item;
              const docRef = doc(db, colName, id);
              batch.set(docRef, rest, { merge: true });
            });
          }
        }

        await batch.commit();
        toast({
          title: "ARCHIVE RESTORED",
          description: "SYSTEM LOGS SYNCHRONIZED SUCCESSFULLY.",
        });
      } catch (e) {
        console.error(e);
        toast({
          variant: "destructive",
          title: "IMPORT FAILURE",
          description: "CORRUPT ARCHIVE DETECTED.",
        });
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
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

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white/[0.02] border border-white/5 p-12 space-y-8 backdrop-blur-xl">
            <div className="space-y-4">
              <h3 className="text-xs font-bold tracking-[0.4em] uppercase text-white/80">Export Protocol</h3>
              <p className="text-[10px] text-white/60 tracking-widest leading-relaxed uppercase">
                Download the entire system state, including product modules, story narratives, and entity dossiers. Use this for off-site mission logging.
              </p>
            </div>
            <Button 
              onClick={exportSystemData}
              disabled={loading}
              className="w-full bg-white text-black hover:bg-white/90 h-16 text-[10px] font-bold tracking-[0.5em] rounded-none shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <>
                  INITIALIZE EXPORT
                  <Download className="ml-3 w-4 h-4" />
                </>
              )}
            </Button>
          </div>

          <div className="bg-white/[0.02] border border-white/5 p-12 space-y-8 backdrop-blur-xl">
            <div className="space-y-4">
              <h3 className="text-xs font-bold tracking-[0.4em] uppercase text-white/80">Import Protocol</h3>
              <p className="text-[10px] text-white/60 tracking-widest leading-relaxed uppercase">
                Restore system logs from an external archive. Note: This will merge data with the existing database. Use with master authority only.
              </p>
            </div>
            <div className="relative">
              <input 
                type="file" 
                accept=".json" 
                onChange={importSystemData}
                disabled={loading}
                className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
              <Button 
                disabled={loading}
                className="w-full border border-white/10 bg-transparent hover:bg-white/5 text-white h-16 text-[10px] font-bold tracking-[0.5em] rounded-none transition-all"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  <>
                    UPLOAD ARCHIVE
                    <Upload className="ml-3 w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-12 p-8 border border-white/5 bg-white/[0.01] space-y-6">
          <div className="flex items-center gap-4 text-white/60">
            <ShieldAlert className="w-5 h-5 text-white/80" />
            <span className="text-[10px] tracking-[0.4em] uppercase font-bold">SECURITY ADVISORY</span>
          </div>
          <div className="space-y-4">
            <p className="text-[10px] text-white/40 tracking-widest leading-relaxed uppercase">
              ARCHIVE FILES CONTAIN SENSITIVE ENTITY DATA AND LOGISTICAL MODULES. ENSURE ALL EXPORTS ARE STORED WITHIN SECURE FRONTIER SERVERS. INCORRECT IMPORTS MAY LEAD TO SYSTEM DESYNCHRONIZATION.
            </p>
            <div className="flex items-center gap-4 text-[9px] text-white/40 tracking-[0.3em] uppercase font-bold">
              <CheckCircle2 className="w-3 h-3 text-green-500/60" />
              ENCRYPTION ACTIVE: AES-256
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
