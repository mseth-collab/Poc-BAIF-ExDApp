/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Command, Book, Newspaper, MessageSquare, Zap, X, CornerDownLeft, Ticket, Sparkles } from 'lucide-react';
import { useEmployee } from './EmployeeContext';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string, query?: string) => void;
}

export function CommandPalette({ isOpen, onClose, onNavigate }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { region } = useEmployee();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        isOpen ? onClose() : onClose(); // Toggle handled by parent
      }
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }
    
    // Core navigation links
    const navigationLinks = [
      { id: 'home', title: 'Go to Dashboard', icon: Zap, category: 'Navigation', isNav: true },
      { id: 'chat', title: 'Ask BestFrAIend', icon: MessageSquare, category: 'AI Tools', isNav: true },
      { id: 'knowledge', title: 'Policy Library', icon: Book, category: 'Resources', isNav: true },
      { id: 'tickets', title: 'Support Tickets', icon: Ticket, category: 'Support', isNav: true },
      { id: 'ai-hub', title: 'AI Innovation Hub', icon: Sparkles, category: 'Projects', isNav: true },
      { id: 'feed', title: 'Internal Updates', icon: Newspaper, category: 'News', isNav: true },
    ].filter(l => l.title.toLowerCase().includes(query.toLowerCase()));

    setResults(navigationLinks);

    const controller = new AbortController();
    setIsSearching(true);

    const debounceTimer = setTimeout(async () => {
      try {
        const res = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, region }),
          signal: controller.signal
        });
        const policyMatches = await res.json();
        
        const mappedPolicies = policyMatches.map((policy: any) => ({
          id: `knowledge`,
          title: policy.title,
          icon: Book,
          category: `Matched Policy [Gemini]`,
          isNav: false,
          searchQuery: `Explain the ${policy.title}`
        }));

        setResults(prev => [...navigationLinks, ...mappedPolicies]);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error("Command palette search fail:", err);
        }
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => {
      clearTimeout(debounceTimer);
      controller.abort();
    };
  }, [query, region]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 w-full max-w-xl bg-white rounded-[32px] shadow-2xl z-[60] overflow-hidden border border-peach-light"
          >
            <div className="relative p-6 border-b border-slate-100 flex items-center gap-4">
              <Search className="text-primary" size={24} strokeWidth={3} />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Find anything (Policies, News, Staff)..."
                className="flex-1 bg-transparent outline-none text-xl font-bold text-[#1F1F1F] placeholder:text-slate-300"
              />
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black bg-slate-100 text-slate-400 px-2 py-1 rounded-md">ESC</span>
                <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full text-slate-400">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto p-4">
              {query.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 bg-peach rounded-2xl flex items-center justify-center text-primary mx-auto mb-4">
                    <Command size={32} strokeWidth={2.5} />
                  </div>
                  <h3 className="font-extrabold text-[#1F1F1F]">Quick Assist Search</h3>
                  <p className="text-slate-500 text-sm font-medium">Type to search across policies, news, and navigation.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {results.length > 0 ? (
                    results.map((res, i) => (
                      <button
                        key={`${res.id}-${i}`}
                        onClick={() => {
                          if (res.isNav) {
                            onNavigate(res.id);
                          } else {
                            onNavigate('chat', res.searchQuery);
                          }
                          onClose();
                        }}
                        className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-primary/5 group transition-all text-left"
                      >
                        <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                          <res.icon size={20} />
                        </div>
                        <div className="flex-1">
                          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{res.category}</p>
                          <h4 className="font-bold text-[#1F1F1F] text-lg">{res.title}</h4>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <CornerDownLeft size={16} className="text-primary" />
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="py-8 text-center text-slate-400">
                      <p className="font-bold">No results found for "{query}"</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <div className="flex gap-4">
                 <div className="flex items-center gap-1">
                    <kbd className="text-[10px] font-black bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-sm text-slate-500">↵</kbd>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Select</span>
                 </div>
                 <div className="flex items-center gap-1">
                    <kbd className="text-[10px] font-black bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-sm text-slate-500">↑↓</kbd>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Navigate</span>
                 </div>
              </div>
              <span className="text-[9px] font-black text-primary uppercase tracking-widest">AI Assisted</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
