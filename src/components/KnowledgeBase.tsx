/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Search, Filter, BookOpen, ExternalLink, ChevronRight, Tag, Sparkles, Target, Printer, Download, X, Bookmark, Mic, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { KnowledgeArticle } from '../types';
import { useEmployee } from './EmployeeContext';

interface KnowledgeBaseProps {
  onNavigate?: (tab: string, query?: string) => void;
  employeeContext?: any;
}

export function KnowledgeBase({ onNavigate, employeeContext }: KnowledgeBaseProps = {}) {
  const { region, setRegion, t, language } = useEmployee();
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(true);
  const [summarizingId, setSummarizingId] = useState<string | null>(null);
  const [summaries, setSummaries] = useState<Record<string, string>>({});
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);

  // Bookmarking System
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('exadel-bookmarked-policies');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('exadel-bookmarked-policies', JSON.stringify(bookmarkedIds));
  }, [bookmarkedIds]);

  const toggleBookmark = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setBookmarkedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Voice Search System
  const [isListening, setIsListening] = useState(false);
  const [listeningError, setListeningError] = useState<string | null>(null);

  const startVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setListeningError("Web Speech API not supported. Performing quick search simulation...");
      setIsListening(true);
      setTimeout(() => {
        const samples = [
          "remote work policy",
          "expense limits",
          "health benefits",
          "PTO limits",
          "compliance guidelines"
        ];
        const randomSample = samples[Math.floor(Math.random() * samples.length)];
        setSearchTerm(randomSample);
        setIsListening(false);
        setListeningError(null);
      }, 2000);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = region === 'PL' ? 'pl-PL' : region === 'DE' ? 'de-DE' : region === 'HR' ? 'hr-HR' : 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setListeningError(null);
      };

      recognition.onerror = (e: any) => {
        console.error("Speech Recognition Error:", e);
        if (e.error === 'not-allowed') {
          setListeningError("Microphone access denied. Simulating voice search query instead...");
        } else {
          setListeningError(`Error speech: ${e.error}. Simulating...`);
        }
        
        // Simulating Voice search fallback when permissions or actual input are locked on browser sandbox
        setTimeout(() => {
          const samples = [
            "remote work policy",
            "expense limits",
            "health benefits",
            "PTO limits",
            "compliance guidelines"
          ];
          const randomSample = samples[Math.floor(Math.random() * samples.length)];
          setSearchTerm(randomSample);
          setIsListening(false);
          setListeningError(null);
        }, 1800);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onresult = (e: any) => {
        const transcript = e.results[0]?.[0]?.transcript;
        if (transcript) {
          // Remove trailing period if present
          const cleanText = transcript.trim().replace(/\.$/, '');
          setSearchTerm(cleanText);
        }
      };

      recognition.start();
    } catch (err) {
      console.error(err);
      setIsListening(false);
    }
  };

  const handlePrint = (article: KnowledgeArticle) => {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const localAddendum = article.regions?.[region] ? `
      <div style="margin-top: 24px; padding: 20px; border: 2px solid #FFEDD5; border-radius: 16px; font-family: 'Outfit', sans-serif; background-color: #FFF9F2;">
        <h4 style="margin: 0 0 8px 0; color: #D45B2C; font-size: 13px; text-transform: uppercase; letter-spacing: 0.15em; font-weight: 800; display: flex; align-items: center; gap: 6px;">
          📍 Regional Addendum (${region})
        </h4>
        <p style="margin: 0; color: #475569; font-size: 13px; line-height: 1.6; font-weight: 500;">
          ${article.regions[region]}
        </p>
      </div>
    ` : '';

    const tagsHtml = article.tags.map(t => `
      <span style="background: #F1F5F9; color: #64748B; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; display: inline-block; margin-right: 6px; margin-bottom: 6px;">
        #${t}
      </span>
    `).join('');

    const iframeContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${article.title} - Exadel Compliance Archive</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
            * {
              box-sizing: border-box;
            }
            body {
              font-family: 'Outfit', -apple-system, sans-serif;
              color: #1F2937;
              line-height: 1.6;
              margin: 40px;
              padding: 0;
              background: #FFFFFF;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .header {
              border-bottom: 2px solid #F1F5F9;
              padding-bottom: 24px;
              margin-bottom: 28px;
            }
            .org-name {
              font-size: 11px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.2em;
              color: #FF8A5C;
              margin-bottom: 6px;
            }
            .title {
              font-size: 28px;
              font-weight: 800;
              color: #0F172A;
              margin: 0 0 12px 0;
              line-height: 1.25;
              letter-spacing: -0.02em;
            }
            .meta-row {
              display: flex;
              align-items: center;
              gap: 12px;
              font-size: 12px;
              color: #64748B;
              font-weight: 600;
              margin-bottom: 16px;
              flex-wrap: wrap;
            }
            .badge {
              background-color: #E6F2FF;
              color: #4D77FF;
              padding: 4px 12px;
              border-radius: 8px;
              text-transform: uppercase;
              font-size: 10px;
              font-weight: 800;
              letter-spacing: 0.05em;
            }
            .badge-it {
              background-color: #E6FFF2;
              color: #20C997;
            }
            .badge-finance {
              background-color: #FEF3C7;
              color: #D97706;
            }
            .badge-general {
              background-color: #F3F4F6;
              color: #4B5563;
            }
            .badge-legal {
              background-color: #FCE7F3;
              color: #DB2777;
            }
            .content {
              font-size: 15px;
              color: #334155;
              line-height: 1.7;
              white-space: pre-wrap;
            }
            .footer {
              margin-top: 60px;
              border-top: 1px dashed #E2E8F0;
              padding-top: 20px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: 11px;
              color: #94A3B8;
              font-weight: 600;
            }
            @media print {
              body {
                margin: 20px;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="org-name">Exadel Employee Reference Center</div>
            <h1 class="title">${article.title}</h1>
            <div class="meta-row">
              <span class="badge ${
                article.category === 'IT' ? 'badge-it' : 
                article.category === 'Finance' ? 'badge-finance' : 
                article.category === 'Legal' ? 'badge-legal' : 
                article.category === 'General' ? 'badge-general' : ''
              }">${article.category} Department</span>
              <span>•</span>
              <span>Official Reference Standard</span>
              <span>•</span>
              <span>Target Region: ${region}</span>
            </div>
            <div>
              ${tagsHtml}
            </div>
          </div>
          
          <div class="content">${article.content}</div>

          ${localAddendum}

          <div class="footer">
            <div>Exadel Inc. Security & Compliance Program • Confidential & Proprietary</div>
            <div>Generated: ${new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
          </div>
        </body>
      </html>
    `;

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(iframeContent);
      doc.close();

      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1200);
      }, 500);
    }
  };

  const handleSummarize = async (article: KnowledgeArticle) => {
    if (summaries[article.id]) return;
    setSummarizingId(article.id);
    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          articleId: article.id,
          region,
          language
        }),
      });
      const data = await res.json();
      setSummaries(prev => ({ ...prev, [article.id]: data.summary || "Summary unavailable at this time." }));
    } catch (err) {
      console.error(err);
      setSummaries(prev => ({ ...prev, [article.id]: "Unable to generate summary. Please check the full policy text." }));
    } finally {
      setSummarizingId(null);
    }
  };

  const categories = ['All', 'Bookmarks', 'HR', 'Finance', 'IT', 'Legal', 'General'];
  const regions = [
    { code: 'PL', name: 'Poland', flag: '🇵🇱' },
    { code: 'HR', name: 'Croatia', flag: '🇭🇷' },
    { code: 'US', name: 'United States', flag: '🇺🇸' },
    { code: 'DE', name: 'Germany', flag: '🇩🇪' },
    { code: 'CA', name: 'Canada', flag: '🇨🇦' },
    { code: 'Other', name: 'Other Regions', flag: '🌍' },
  ];

  useEffect(() => {
    fetch(`/api/knowledge?language=${language}`)
      .then(res => res.json())
      .then(data => {
        setArticles(data);
        setIsLoading(false);
      });
  }, [language]);

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          article.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' 
      ? true 
      : selectedCategory === 'Bookmarks'
        ? bookmarkedIds.includes(article.id)
        : article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-10 max-w-6xl mx-auto space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex-1">
          <span className="text-[10px] font-black text-primary uppercase tracking-widest mb-2 block">Foundations & Rules</span>
          <h2 className="text-4xl font-extrabold text-[#1F1F1F] mb-6">Geo-Aware Policy Library</h2>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={20} strokeWidth={3} />
              <input
                type="text"
                placeholder={isListening ? "Listening... Speak now!" : "Search policies or use voice..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-12 pr-14 py-4 bg-white border-2 rounded-[28px] outline-none transition-all font-medium ${
                  isListening 
                    ? 'border-rose-500 ring-4 ring-rose-500/10 placeholder-rose-600 font-extrabold text-[#1F1F1F]' 
                    : 'border-primary/20 focus:ring-4 focus:ring-primary/10 focus:border-primary'
                }`}
              />
              <button
                type="button"
                onClick={startVoiceSearch}
                className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all ${
                  isListening 
                    ? 'bg-rose-500 text-white animate-pulse' 
                    : 'text-slate-400 hover:text-primary hover:bg-slate-100'
                }`}
                title="Voice Search"
              >
                <Mic size={18} strokeWidth={2.5} />
              </button>
            </div>
          </div>
          {listeningError && (
            <span className="text-xs text-rose-500 mt-1 block font-semibold">
              ⚠️ {listeningError}
            </span>
          )}
          {isListening && (
            <div className="flex items-center gap-1.5 mt-2 text-xs text-rose-500 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping inline-block" />
              <span>BestFrAIend Voice is tuning in... speak clearly</span>
            </div>
          )}
        </div>
        <div className="bg-white border-2 border-slate-100 p-4 rounded-[32px] flex items-center gap-3 shadow-sm">
          <span className="text-[10px] font-black uppercase text-slate-400">Current Region:</span>
          <div className="flex gap-1">
            {regions.map(r => (
              <button
                key={r.code}
                onClick={() => {
                   setRegion(r.code);
                }}
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all ${region === r.code ? 'bg-primary text-white scale-110 shadow-md' : 'bg-slate-50 grayscale opacity-40 hover:grayscale-0 hover:opacity-100'}`}
                title={r.name}
              >
                {r.flag}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar items-center">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-6 py-2.5 rounded-[20px] text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
              selectedCategory === cat 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'bg-white border-2 border-slate-100 text-slate-500 hover:border-primary/40'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => <div key={i} className="h-64 bg-white rounded-[40px] animate-pulse border-4 border-slate-50" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredArticles.map((article) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={article.id}
                className="bg-white border-2 border-slate-50 rounded-[40px] p-8 shadow-sm hover:shadow-xl hover:border-peach-light transition-all flex flex-col group"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 bg-peach rounded-[20px] flex items-center justify-center text-primary shadow-sm group-hover:bg-primary group-hover:text-white transition-all">
                    <BookOpen size={24} strokeWidth={2.5} />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBookmark(article.id, e);
                      }}
                      className={`p-2 rounded-xl transition-all ${
                        bookmarkedIds.includes(article.id)
                          ? 'text-amber-500 hover:text-amber-600 bg-amber-50'
                          : 'text-slate-400 hover:text-amber-500 hover:bg-slate-50'
                      }`}
                      title={bookmarkedIds.includes(article.id) ? "Remove Bookmark" : "Add Bookmark"}
                    >
                      <Bookmark size={15} strokeWidth={2.5} fill={bookmarkedIds.includes(article.id) ? "currentColor" : "none"} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrint(article);
                      }}
                      className="p-2 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-xl transition-all"
                      title="Print / Save PDF"
                    >
                      <Printer size={15} strokeWidth={2.5} />
                    </button>
                    <span className={`text-[10px] font-black px-3 py-1 rounded-md uppercase tracking-widest ${
                      article.category === 'HR' ? 'bg-[#E6F2FF] text-[#4D77FF]' :
                      article.category === 'IT' ? 'bg-[#E6FFF2] text-[#20C997]' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                      {article.category}
                    </span>
                  </div>
                </div>
                <h3 className="text-xl font-black text-[#1F1F1F] mb-3 leading-tight group-hover:text-primary transition-colors">{article.title}</h3>
                
                <div className="mb-6 flex-1 min-h-[80px]">
                  {summaries[article.id] ? (
                    <motion.div 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }}
                      className="text-xs text-primary-dark font-bold bg-primary/5 p-4 rounded-2xl border border-primary/10"
                    >
                      <Sparkles size={14} className="inline mr-2 mb-1" />
                      <ReactMarkdown>{summaries[article.id]}</ReactMarkdown>
                    </motion.div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-slate-500 font-medium italic opacity-80 leading-relaxed">
                        "{article.content}"
                      </p>
                      {article.regions?.[region as keyof typeof article.regions] && (
                        <div className="bg-amber-50 border border-amber-100 p-3 rounded-2xl">
                          <p className="text-[9px] font-black uppercase text-amber-600 tracking-widest mb-1 flex items-center gap-1">
                            <Target size={10} /> Local {region} Addendum
                          </p>
                          <p className="text-xs font-bold text-amber-900 leading-tight">
                            {article.regions[region as keyof typeof article.regions]}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mb-8">
                  {article.tags.map(tag => (
                    <span key={tag} className="text-[10px] font-black uppercase tracking-wider bg-slate-50 text-slate-400 px-3 py-1 rounded-full border border-slate-100">
                      #{tag}
                    </span>
                  ))}
                </div>
                <div className="flex flex-col gap-3 pt-6 border-t-2 border-slate-50">
                  {summarizingId === article.id ? (
                    <div className="flex items-center gap-2 text-primary animate-pulse text-[10px] font-black uppercase tracking-widest">
                       <Sparkles size={14} className="animate-spin" /> Summarizing...
                    </div>
                  ) : !summaries[article.id] && (
                    <button 
                      onClick={() => handleSummarize(article)}
                      className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2 hover:translate-x-1 transition-transform w-fit"
                    >
                      <Sparkles size={14} /> AI Summary
                    </button>
                  )}
                  <button 
                    onClick={() => setSelectedArticle(article)}
                    className="w-full flex items-center justify-between text-xs font-black uppercase tracking-widest text-[#1F1F1F] hover:text-primary transition-colors"
                  >
                    View Full Policy
                    <ChevronRight size={18} strokeWidth={3} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modal Overlay for Full Policy reading and printing */}
      <AnimatePresence>
        {selectedArticle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 sm:p-6"
            onClick={() => setSelectedArticle(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-[32px] max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border-2 border-primary/10 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-6 sm:p-8 border-b-2 border-slate-50 flex justify-between items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span className={`text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest ${
                      selectedArticle.category === 'HR' ? 'bg-[#E6F2FF] text-[#4D77FF]' :
                      selectedArticle.category === 'IT' ? 'bg-[#E6FFF2] text-[#20C997]' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                      {selectedArticle.category} Policy
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Region: {region}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 leading-tight">
                    {selectedArticle.title}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => toggleBookmark(selectedArticle.id, e)}
                    className={`p-2.5 rounded-full transition-all ${
                      bookmarkedIds.includes(selectedArticle.id)
                        ? 'bg-amber-50 text-amber-500 hover:text-amber-600'
                        : 'bg-slate-50 text-slate-400 hover:text-amber-500 hover:bg-slate-100'
                    }`}
                    title={bookmarkedIds.includes(selectedArticle.id) ? "Remove Bookmark" : "Add Bookmark"}
                  >
                    <Bookmark size={18} strokeWidth={2.5} fill={bookmarkedIds.includes(selectedArticle.id) ? "currentColor" : "none"} />
                  </button>
                  <button
                    onClick={() => setSelectedArticle(null)}
                    className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-800 rounded-full transition-all"
                    aria-label="Close"
                  >
                    <X size={20} strokeWidth={2.5} />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 text-slate-700 font-medium">
                {summaries[selectedArticle.id] ? (
                  <div className="p-5 bg-primary/5 rounded-[24px] border border-primary/10 text-xs text-primary-dark font-semibold">
                    <span className="flex items-center gap-1.5 font-black uppercase tracking-wider text-[10px] text-primary mb-2">
                      <Sparkles size={14} /> AI Summary Reference
                    </span>
                    <ReactMarkdown>{summaries[selectedArticle.id]}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="p-1">
                    {summarizingId === selectedArticle.id ? (
                      <div className="flex items-center gap-2 text-primary animate-pulse text-[10px] font-black uppercase tracking-widest bg-primary/5 p-4 rounded-2xl border border-primary/10">
                         <Sparkles size={14} className="animate-spin" /> Summarizing policy...
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleSummarize(selectedArticle)}
                        className="text-[10px] font-black bg-primary/5 hover:bg-primary/10 border border-primary/10 py-2.5 px-4 rounded-xl uppercase tracking-widest text-primary flex items-center gap-2 transition-all active:scale-95"
                      >
                        <Sparkles size={14} /> Generate AI Summary
                      </button>
                    )}
                  </div>
                )}

                <div className="prose prose-slate max-w-none text-sm leading-relaxed whitespace-pre-wrap text-slate-600 font-medium font-sans">
                  {selectedArticle.content}
                </div>

                {selectedArticle.regions?.[region] && (
                  <div className="p-5 bg-amber-50/70 border-2 border-amber-100/60 rounded-[24px] space-y-2">
                    <span className="flex items-center gap-1.5 font-black uppercase tracking-wider text-[10px] text-amber-600">
                      <Target size={14} /> Local Regional Addendum ({region})
                    </span>
                    <p className="text-xs font-bold text-amber-900 leading-normal">
                      {selectedArticle.regions[region]}
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-4">
                  {selectedArticle.tags.map(tag => (
                    <span key={tag} className="text-[10px] font-black uppercase tracking-wider bg-slate-50 text-slate-400 px-3 py-1 rounded-full border border-slate-100">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 sm:p-8 bg-slate-50/50 border-t-2 border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8]">
                  Verified for Security & GDPR Sync
                </span>
                <button
                  onClick={() => handlePrint(selectedArticle)}
                  className="w-full sm:w-auto px-6 py-3.5 bg-primary hover:bg-primary-dark text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Printer size={16} strokeWidth={2.5} />
                  Print / Download PDF
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
