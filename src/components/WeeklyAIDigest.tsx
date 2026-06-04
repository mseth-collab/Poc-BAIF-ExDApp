/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Newspaper, Sparkles, TrendingUp, ArrowRight } from 'lucide-react';
import { useEmployee } from './EmployeeContext';

interface DigestData {
  week: string;
  impact: string;
  summaries: { title: string; body: string }[];
  action: string;
}

export function WeeklyAIDigest() {
  const { region } = useEmployee();
  const [digest, setDigest] = useState<DigestData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/ai-digest?region=${region}`)
      .then(res => res.json())
      .then(data => {
        setDigest(data);
        setIsLoading(false);
      });
  }, [region]);

  if (isLoading || !digest) {
    return (
      <div className="bg-white border-2 border-slate-50 p-10 rounded-[40px] animate-pulse h-80" />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-primary/5 border-2 border-primary/10 rounded-2xl p-6 relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 p-4 transform group-hover:scale-110 transition-transform text-primary/15">
        <Sparkles size={80} strokeWidth={1} />
      </div>

      <div className="relative flex flex-col md:flex-row gap-6">
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-md shadow-primary/15">
              <Newspaper size={20} />
            </div>
            <div>
              <span className="text-[9px] font-black text-primary uppercase tracking-widest block">AI Editorial</span>
              <h3 className="text-2xl font-black text-[#1F1F1F]">Weekly AI Digest</h3>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="bg-white px-3 py-1 rounded-full border border-slate-100 flex items-center gap-1.5">
               <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
               <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{digest.week}</span>
            </div>
            <div className="bg-amber-150 px-3 py-1 rounded-full border border-amber-200 flex items-center gap-1.5">
               <TrendingUp size={10} className="text-amber-700" />
               <span className="text-[9px] font-black uppercase text-amber-700 tracking-widest">Impact: {digest.impact}</span>
            </div>
          </div>

          <p className="text-base font-bold text-primary-dark leading-snug">
            "{digest.action}"
          </p>
          
          <button className="flex items-center gap-2 bg-[#1F1F1F] text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-102 active:scale-95 transition-all shadow-md">
            Register for Workshops <ArrowRight size={14} strokeWidth={3} />
          </button>
        </div>

        <div className="flex-1 grid gap-3">
          {digest.summaries.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white/60 backdrop-blur-xs p-4 rounded-xl border border-white hover:bg-white transition-colors"
            >
              <h4 className="font-black text-base text-primary-dark mb-0.5">{item.title}</h4>
              <p className="text-[11px] font-bold text-slate-500 leading-relaxed">{item.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
