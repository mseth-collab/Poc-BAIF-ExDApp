/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Zap, Globe, Cpu, Radio } from 'lucide-react';

const NEWS_ITEMS = [
  "Gemini 2.0 Pro Ultra announced with 10M context window",
  "NVIDIA reaches $5T market cap as AI infrastructure demand surges",
  "Apple Vision Pro 2 rumors: Lighter design and internal battery",
  "Neuralink successfully implants second human patient for clinical trials",
  "Quantum computing breakthrough: Google achieves 1000-qubit coherence",
  "SpaceX Starship prepares for its most ambitious orbital flight yet",
  "Microsoft Open Sources 'Phi-4' - A tiny but mighty LLM",
  "European Union clears new regulations for AI Data Center energy efficiency"
];

export function TechTicker() {
  return (
    <div className="bg-[#1F1F1F] text-white py-2 overflow-hidden whitespace-nowrap flex items-center border-t border-white/5 relative z-10">
      <div className="px-6 border-r border-white/10 flex items-center gap-2 flex-shrink-0 bg-[#1F1F1F] z-20">
        <Radio size={14} className="text-primary animate-pulse" />
        <span className="text-[10px] font-black uppercase tracking-widest">Global Tech News</span>
      </div>
      
      <div className="flex animate-marquee">
        {/* We double the items for seamless loop */}
        {[...NEWS_ITEMS, ...NEWS_ITEMS].map((item, idx) => (
          <div key={idx} className="flex items-center gap-6 px-10">
            <Cpu size={12} className="text-primary/50" />
            <span className="text-[10px] font-bold tracking-wide text-white/70 uppercase">
              {item}
            </span>
            <div className="w-1 h-1 bg-white/10 rounded-full" />
          </div>
        ))}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          animation: marquee 40s linear infinite;
        }
      `}} />
    </div>
  );
}
