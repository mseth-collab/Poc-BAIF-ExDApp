/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { HelpCircle, ArrowRight, MessageCircle, Shield, CreditCard, LifeBuoy } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useEmployee } from './EmployeeContext';

interface FAQ {
  id: string;
  question: string;
  category: string;
}

interface QuickHelpProps {
  onAsk: (question: string) => void;
}

export function QuickHelp({ onAsk }: QuickHelpProps) {
  const { language } = useEmployee();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/faqs?language=${language}`)
      .then(res => res.json())
      .then(data => {
        setFaqs(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [language]);

  const getIcon = (category: string) => {
    switch (category) {
      case 'IT': return <Shield className="text-blue-500" size={16} />;
      case 'Finance': return <CreditCard className="text-emerald-500" size={16} />;
      case 'HR': return <LifeBuoy className="text-orange-500" size={16} />;
      default: return <HelpCircle className="text-slate-400" size={16} />;
    }
  };

  if (isLoading) return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 animate-pulse shadow-sm">
      <div className="h-4 w-32 bg-slate-100 rounded mb-4" />
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-12 bg-slate-50 rounded-xl" />
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-md font-extrabold text-[#1F1F1F] flex items-center gap-2">
            <HelpCircle className="text-primary" size={18} />
            Quick Help
          </h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Common Support Queries</p>
        </div>
      </div>

      <div className="space-y-2">
        {faqs.map((faq, idx) => (
          <motion.button 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            key={faq.id}
            onClick={() => onAsk(faq.question)}
            className="w-full text-left p-3.5 rounded-xl bg-slate-50 border border-transparent hover:border-primary/20 hover:bg-white hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                {getIcon(faq.category)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">{faq.category} Policy</span>
                </div>
                <h4 className="text-xs font-bold text-[#1F1F1F] leading-snug group-hover:text-primary transition-colors truncate">
                  {faq.question}
                </h4>
              </div>
              <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <ArrowRight size={12} className="text-primary" />
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      <button 
        onClick={() => onAsk('')}
        className="w-full mt-4 py-3 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all flex items-center justify-center gap-1.5"
      >
        <MessageCircle size={12} />
        Open Full Chat
      </button>
    </div>
  );
}
