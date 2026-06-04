/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Calendar, Newspaper, Briefcase, CalendarDays, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import { FeedItem } from '../types';
import { useEmployee } from './EmployeeContext';

interface OrgFeedProps {
  onNavigate?: (tab: string, query?: string) => void;
  employeeContext?: any;
}

export function OrgFeed({ onNavigate, employeeContext }: OrgFeedProps = {}) {
  const { region, setRegion, t, language } = useEmployee();
  const [items, setItems] = useState<FeedItem[]>([]);
  const [activeType, setActiveType] = useState<'all' | 'news' | 'event' | 'job'>('all');

  useEffect(() => {
    fetch(`/api/feed?language=${language}`)
      .then(res => res.json())
      .then(setItems);
  }, [language]);

  const filtered = items.filter(i => {
    const typeMatch = activeType === 'all' || i.type === activeType;
    const regionMatch = !i.region || i.region === 'Global' || i.region === region;
    return typeMatch && regionMatch;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'news': return <Newspaper size={16} />;
      case 'event': return <Calendar size={16} />;
      case 'job': return <Briefcase size={16} />;
      default: return null;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'news': return 'text-sky-500 bg-sky-50';
      case 'event': return 'text-amber-500 bg-amber-50';
      case 'job': return 'text-emerald-500 bg-emerald-50';
      default: return 'text-slate-500 bg-slate-50';
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <header className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-1">Org Feed</h2>
          <p className="text-slate-500">Latest from across the company.</p>
        </div>
        <div className="flex bg-white border border-slate-200 p-1 rounded-xl">
          {['all', 'news', 'event', 'job'].map(type => (
            <button
              key={type}
              onClick={() => setActiveType(type as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                activeType === type 
                ? 'bg-slate-900 text-white' 
                : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </header>

      <div className="space-y-4">
        {filtered.map((item, idx) => (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={item.id}
            className="group relative bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-100 transition-all"
          >
            <div className="flex gap-5">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${getTypeColor(item.type)}`}>
                {getTypeIcon(item.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    {item.category}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                    <CalendarDays size={10} />
                    {item.date}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                  {item.description}
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors">
                    View Details <ArrowUpRight size={14} />
                  </button>
                  {item.type === 'job' && (
                    <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
                      Refer a Friend
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
