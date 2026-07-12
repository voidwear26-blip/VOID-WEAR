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
    <div className="pt-48 pb-32 bg-white min-h-screen">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto space-y-32">
          <div className="space-y-8 text-center md:text-left">
            <div className="flex items-center gap-4 justify-center md:justify-start">
              <TrendingUp className="w-4 h-4 text-black/20" />
              <span className="text-xs font-bold tracking-[0.6em] text-black/40 uppercase">SYSTEM // STORIES</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-bold tracking-tight uppercase leading-none text-black">Stories</h1>
            <p className="text-lg md:text-xl text-black/60 font-light tracking-widest leading-relaxed uppercase">
              LATEST UPDATES AND TECHNICAL TRENDS.
            </p>
          </div>

          <div className="space-y-24">
            {isLoading ? (
              <div className="py-32 flex flex-col items-center justify-center gap-6 opacity-20">
                <Loader2 className="w-8 h-8 animate-spin text-black" />
                <p className="text-[10px] tracking-[1em] uppercase">Loading Stories...</p>
              </div>
            ) : stories && stories.length > 0 ? (
              stories.map((story, idx) => (
                <motion.div 
                  key={story.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="group relative"
                >
                  <div className="grid md:grid-cols-2 gap-16 items-start">
                    {story.imageUrl && (
                      <div className="bg-black/5 border border-black/5 overflow-hidden w-full">
                        <Image 
                          src={story.imageUrl} 
                          alt={story.title} 
                          width={1200}
                          height={1200}
                          className="w-full h-auto grayscale group-hover:grayscale-0 transition-all duration-1000"
                          unoptimized
                        />
                      </div>
                    )}
                    <div className="space-y-8">
                      <div className="flex items-center gap-4">
                        <span className={`text-[8px] font-bold tracking-[0.3em] px-3 py-1 border uppercase ${
                          story.type === 'OFFER' ? 'border-green-500/20 text-green-600' : 
                          story.type === 'TREND' ? 'border-blue-500/20 text-blue-600' : 
                          'border-black/10 text-black/40'
                        }`}>
                          {story.type}
                        </span>
                        <div className="flex items-center gap-2 text-[8px] text-black/20 tracking-widest uppercase font-bold">
                          <Calendar className="w-3 h-3" />
                          {new Date(story.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <h2 className="text-3xl md:text-4xl font-black tracking-tight uppercase text-black">{story.title}</h2>
                      <p className="text-sm text-black/60 tracking-widest leading-relaxed uppercase whitespace-pre-line font-light">
                        {story.content}
                      </p>
                      <div className="pt-8 border-t border-black/5">
                         <Link href="/products" className="group/link flex items-center gap-4 text-[9px] font-bold tracking-[0.4em] text-black/40 hover:text-black transition-all uppercase">
                            VIEW COLLECTION
                            <ArrowRight className="w-3 h-3 group-hover/link:translate-x-2 transition-transform" />
                         </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="py-32 text-center opacity-20 border border-dashed border-black/5">
                <div className="flex flex-col items-center gap-6">
                  <Megaphone className="w-12 h-12 stroke-[0.5px] text-black" />
                  <p className="text-[10px] tracking-[1em] uppercase font-bold text-black">NO STORIES AVAILABLE</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
