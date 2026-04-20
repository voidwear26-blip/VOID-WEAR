
"use client"

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { Megaphone, Calendar, ArrowRight, Loader2, Sparkles, Zap, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function StoryPage() {
  const db = useFirestore();

  const storiesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'stories'), orderBy('createdAt', 'desc'));
  }, [db]);

  const { data: stories, isLoading } = useCollection(storiesQuery);

  return (
    <div className="pt-48 pb-32 bg-transparent min-h-screen">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto space-y-32">
          {/* Header */}
          <div className="space-y-8 text-center md:text-left">
            <div className="flex items-center gap-4 justify-center md:justify-start">
              <TrendingUp className="w-4 h-4 text-white/40" />
              <span className="text-xs font-bold tracking-[0.6em] text-white/40 uppercase">SYSTEM // TRENDS</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-bold tracking-tight glow-text uppercase leading-none">The Feed</h1>
            <p className="text-lg md:text-xl text-white/70 font-light tracking-widest leading-relaxed uppercase">
              ARCHITECTURAL UPDATES, SEASONAL OFFERS, AND TECHNICAL TRENDS FROM THE VOID.
            </p>
          </div>

          {/* Dynamic Feed */}
          <div className="space-y-24">
            {isLoading ? (
              <div className="py-32 flex flex-col items-center justify-center gap-6 opacity-20">
                <Loader2 className="w-8 h-8 animate-spin" />
                <p className="text-[10px] tracking-[1em] uppercase">Syncing Trends...</p>
              </div>
            ) : stories && stories.length > 0 ? (
              stories.map((story, idx) => (
                <motion.div 
                  key={story.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="group relative"
                >
                  <div className="grid md:grid-cols-2 gap-16 items-start">
                    {story.imageUrl && (
                      <div className="relative aspect-video md:aspect-[4/3] bg-white/5 border border-white/5 overflow-hidden">
                        <Image 
                          src={story.imageUrl} 
                          alt={story.title} 
                          fill 
                          className="object-cover grayscale group-hover:grayscale-0 transition-all duration-1000"
                          unoptimized
                        />
                      </div>
                    )}
                    <div className="space-y-8">
                      <div className="flex items-center gap-4">
                        <span className={`text-[8px] font-bold tracking-[0.3em] px-3 py-1 border uppercase ${
                          story.type === 'OFFER' ? 'border-green-500/30 text-green-500/80' : 
                          story.type === 'TREND' ? 'border-blue-500/30 text-blue-500/80' : 
                          'border-white/20 text-white/40'
                        }`}>
                          {story.type}
                        </span>
                        <div className="flex items-center gap-2 text-[8px] text-white/20 tracking-widest uppercase font-bold">
                          <Calendar className="w-3 h-3" />
                          {new Date(story.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <h2 className="text-3xl md:text-4xl font-black tracking-tight uppercase glow-text text-white">{story.title}</h2>
                      <p className="text-sm text-white/60 tracking-widest leading-relaxed uppercase whitespace-pre-line font-light">
                        {story.content}
                      </p>
                      <div className="pt-8 border-t border-white/5">
                         <Link href="/products" className="group/link flex items-center gap-4 text-[9px] font-bold tracking-[0.4em] text-white/40 hover:text-white transition-all uppercase">
                            EXPLORE THE ASSEMBLAGE
                            <ArrowRight className="w-3 h-3 group-hover/link:translate-x-2 transition-transform" />
                         </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="py-32 text-center opacity-20 border border-dashed border-white/10">
                <div className="flex flex-col items-center gap-6">
                  <Megaphone className="w-12 h-12 stroke-[0.5px]" />
                  <p className="text-[10px] tracking-[1em] uppercase font-bold">TREND CHANNEL IDLE</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
