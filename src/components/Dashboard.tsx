/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, Zap, Target, BookOpen, MessageSquare, Search, SearchIcon, Bot, ChevronRight, Smile, Bookmark, Smartphone, Settings, HelpCircle } from 'lucide-react';
import { FeedItem, KnowledgeArticle } from '../types';
import { useEffect, useState, useRef } from 'react';
import { TechTicker } from './TechTicker';
import { OnboardingGuide } from './OnboardingGuide';
import { QuickHelp } from './QuickHelp';
import { useEmployee } from './EmployeeContext';

interface DashboardProps {
  onNavigate: (tab: string, query?: string) => void;
  employeeContext?: any;
}

export function Dashboard({ onNavigate, employeeContext }: DashboardProps) {
  const { region, setRegion, t, employee, language, regions, activePersonaId, setActivePersonaId, personas, activePersona } = useEmployee();
  const [recentFeed, setRecentFeed] = useState<FeedItem[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [feedSummary, setFeedSummary] = useState<string | null>(null);
  const [meetingSummary, setMeetingSummary] = useState<string | null>(null);
  const [isSummarizingFeed, setIsSummarizingFeed] = useState(false);
  const [isSummarizingMeetings, setIsSummarizingMeetings] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<KnowledgeArticle[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isQuickAnswering, setIsQuickAnswering] = useState(false);
  const [quickAnswer, setQuickAnswer] = useState<string | null>(null);
  const [stats, setStats] = useState({ activeUsers: 142, openTICKETS: 3, remoteOffices: 8 });
  const [sideTab, setSideTab] = useState<'faq' | 'onboard'>('faq');
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetch('/api/stats').then(res => res.json()).then(setStats);
  }, []);

  const handleQuickAsk = async () => {
    if (!searchTerm.trim()) return;
    setIsQuickAnswering(true);
    setSearchResults([]);
    setQuickAnswer(""); // Reset for typing effect
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [{ role: 'user', content: searchTerm }],
          region,
          language
        }),
      });
      const data = await res.json();
      
      // Simulate typing effect
      const fullText = data.content || "";
      let currentText = "";
      const words = fullText.split(" ");
      
      for (let i = 0; i < words.length; i++) {
        currentText += (i === 0 ? "" : " ") + words[i];
        setQuickAnswer(currentText);
        await new Promise(r => setTimeout(r, 20 + Math.random() * 30));
      }
    } catch (err) {
      console.error(err);
      setQuickAnswer("I'm sorry, I couldn't get an answer right now. Please try again or visit the full chat.");
    } finally {
      setIsQuickAnswering(false);
    }
  };

  useEffect(() => {
    fetch(`/api/feed?language=${language}`)
      .then(res => res.json())
      .then(data => {
        // Filter feed by region or global
        const filtered = data.filter((item: FeedItem) => item.region === region || item.region === 'Global');
        setRecentFeed(filtered.slice(0, 3));
      });

    fetch(`/api/meetings?language=${language}`)
      .then(res => res.json())
      .then(data => setMeetings(data));
  }, [region, language]);

  useEffect(() => {
    if (searchTerm.length < 3 || quickAnswer) {
      setSearchResults([]);
      return;
    }

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    searchTimeout.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: searchTerm, region }),
        });
        const data = await res.json();
        setSearchResults(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [searchTerm, region]);

  const handleSummarizeFeed = async () => {
    setIsSummarizingFeed(true);
    setFeedSummary(null);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          region,
          language,
          messages: [{ 
            role: 'user', 
            content: `Summarize the following recent company news for region ${region} in one short sentence, translated to the user's language ${language}: ${JSON.stringify(recentFeed)}` 
          }] 
        }),
      });
      const data = await res.json();
      
      // Simulate typing effect
      const fullText = data.content || "I couldn't generate a news brief. Please try again later.";
      let currentText = "";
      const words = fullText.split(" ");
      for (let i = 0; i < words.length; i++) {
        currentText += (i === 0 ? "" : " ") + words[i];
        setFeedSummary(currentText);
        await new Promise(r => setTimeout(r, 15 + Math.random() * 20));
      }
    } catch (err) {
      console.error(err);
      setFeedSummary("Local hub news update: Warsaw expansion planning is on track for Q3.");
    } finally {
      setIsSummarizingFeed(false);
    }
  };

  const handleSummarizeMeetings = async () => {
    setIsSummarizingMeetings(true);
    setMeetingSummary(null);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          region,
          language,
          messages: [{ 
            role: 'user', 
            content: `Summarize the key outcomes from these recent meetings in one concise sentence, translated to the user's language ${language}: ${JSON.stringify(meetings)}` 
          }] 
        }),
      });
      const data = await res.json();

      const fullText = data.content || "I couldn't summarize the meetings. Please try again later.";
      let currentText = "";
      const words = fullText.split(" ");
      for (let i = 0; i < words.length; i++) {
        currentText += (i === 0 ? "" : " ") + words[i];
        setMeetingSummary(currentText);
        await new Promise(r => setTimeout(r, 15 + Math.random() * 20));
      }
    } catch (err) {
      console.error(err);
      setMeetingSummary("Regional engineering integration metrics are improving weekly.");
    } finally {
      setIsSummarizingMeetings(false);
    }
  };

  const shortcuts = [
    { label: 'Request PTO', icon: '🌴', action: () => onNavigate('chat', `How do I request PTO for region ${region}?`) },
    { label: 'File Expense', icon: '💰', action: () => onNavigate('chat', `What are the expense rules for ${region}?`) },
    { label: 'IT Support', icon: '🛠️', action: () => onNavigate('tickets') },
    { label: 'AI Initiatives', icon: '✨', action: () => onNavigate('ai-hub') },
  ];

  const categories = [
    { label: 'HR & People', desc: 'Policies, Onboarding', icon: '🫂', color: 'bg-[#E6F2FF]', key: 'knowledge' },
    { label: 'Finance', desc: 'Expenses, Payroll', icon: '💸', color: 'bg-[#FFF2E6]', key: 'knowledge' },
    { label: 'Tech Stack', desc: 'Wiki, Runbooks', icon: '💻', color: 'bg-[#F0FFF4]', key: 'knowledge' },
    { label: 'Support Desk', desc: 'Open Tickets', icon: 'tickets', key: 'tickets' },
  ];

  // Helper values for persona dashboard state
  const getDynamicPersonaCards = () => {
    switch (activePersonaId) {
      case 'anna':
        return {
          card1Val: "26 Days", card1Lbl: "Accrued Annual PL Leave", card1Query: "What is my vacation balance?",
          card2Val: "PIT-11 Ready", card2Lbl: "Warsaw Tax Portal File", card2Query: "How do I download my PIT-11 document?",
          card3Val: "+2 Days", card3Lbl: "Paid Corporate Bridge Days", card3Query: "Tell me about Poland wellness bridge days",
          card4Val: "Platform Eng", card4Lbl: "Warsaw Spire Hub", card4Query: "Are there any internal platform engineering openings?"
        };
      case 'oleksandr':
        return {
          card1Val: "24 Days", card1Lbl: "UA Annual Leave Statutory", card1Query: "How many vacation days do I accrue in Ukraine?",
          card2Val: "FOP Group III", card2Lbl: "Unified 5% Tax Filing Auto", card2Query: "How are Private Entrepreneur FOP taxes filed in UA?",
          card3Val: "Martial Law Update", card3Lbl: "Statutory holidays working days", card3Query: "What are the local holidays in Ukraine?",
          card4Val: "Software Dev", card4Lbl: "Kyiv Hotdesk Facility Available", card4Query: "Who is my regional HR contact in Ukraine?"
        };
      case 'jane':
        return {
          card1Val: "Unlimited FTO", card1Lbl: "US Salaried Flexible Time Off", card1Query: "What is the US FTO policy?",
          card2Val: "W-4 Form Ready", card2Lbl: "Continuous Tax Withholding", card2Query: "How do I update W-4 withholdings in Workday?",
          card3Val: "Ends in 5 days", card3Lbl: "Health Benefits Open Enrollment", card3Query: "How do I select my health benefits for open enrollment?",
          card4Val: "Senior Analyst", card4Lbl: "Remote US East Desk", card4Query: "Who is my HR contact in USA?"
        };
      case 'sophie':
        return {
          card1Val: "15-20 Days", card1Lbl: "Provincial Statutory Minimum", card1Query: "What are Ontario and Canada vacation guidelines?",
          card2Val: "T4 Slips Inbound", card2Lbl: "Canadian Tax & Remuneration Slip", card2Query: "Where can I log my Canadian T4 tax documents?",
          card3Val: "4% Corporate Match", card3Lbl: "Registered Retirement RRSP Match", card3Query: "Tell me about the Canadian RRSP Matching Policy",
          card4Val: "Solutions Architect", card4Lbl: "Toronto Flex Desk Space", card4Query: "Who is the HR coordinator for Exadel Canada?"
        };
      default:
        return {
          card1Val: "12 Days", card1Lbl: "Accrued Remaining", card1Query: "How do I file vacation?",
          card2Val: "1 Overdue", card2Lbl: "Compliance Course", card2Query: "Are there overdue compliance runs?",
          card3Val: "Ends in 5d", card3Lbl: "Open Election", card3Query: "Where are benefits listed?",
          card4Val: "Platform Engineer", card4Lbl: "Remote PL • Open", card4Query: "Open jobs listed"
        };
    }
  };

  const dynCards = getDynamicPersonaCards();

  return (
    <div className="flex h-full">
      <div className="flex-1 p-10 overflow-y-auto space-y-12">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="welcome-text">
            <span className="text-[10px] font-black text-primary uppercase tracking-widest mb-1 block">
              {t('portalContext')}
            </span>
            <h1 className="text-4xl font-extrabold text-slate-950">Hi, {employee.name}! 👋</h1>
            <div className="flex items-center gap-2 mt-1 select-none">
              <span className="text-slate-500 text-sm font-bold">Workspace Region locked:</span>
              <span className="inline-flex items-center gap-1.5 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full text-xs font-black text-slate-800">
                {regions.find(r => r.code === region)?.flag || '🌍'} 
                {regions.find(r => r.code === region)?.name || region} &mdash; {region}
              </span>
            </div>
          </div>
          <div className="flex gap-4 items-center">
             <button 
              onClick={handleSummarizeFeed}
              disabled={isSummarizingFeed}
              className="flex items-center gap-2 px-6 py-2 bg-primary/10 text-primary hover:bg-primary/20 transition-all shadow-sm disabled:opacity-50 rounded-full text-[10px] font-black uppercase tracking-widest"
             >
                <Sparkles size={14} className={isSummarizingFeed ? 'animate-spin' : ''} />
                {feedSummary ? 'Region Briefed' : 'Brief Region'}
             </button>
             <button 
              onClick={handleSummarizeMeetings}
              disabled={isSummarizingMeetings}
              className="flex items-center gap-2 px-6 py-2 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all shadow-sm disabled:opacity-50"
             >
                <Target size={14} className={isSummarizingMeetings ? 'animate-spin' : ''} />
                {meetingSummary ? 'Summary Ready' : 'Global Summary'}
             </button>
            <div className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center font-black shadow-sm uppercase text-sm border border-primary/25">
              {employee.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
            </div>
          </div>
        </header>

        {/* Dynamic Highlight Hub (Moment 1: Dynamic Dashboard Stats based on active persona) */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm relative overflow-hidden transition-all hover:shadow-md">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-peach shadow-xs" />
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10 items-center">
            {/* Stat 1: Accrued PTO */}
            <div className="flex items-center gap-4 p-4 bg-rose-50/50 rounded-2xl border border-rose-100/40 hover:bg-rose-50 hover:scale-[1.01] transition-all cursor-pointer"
                 onClick={() => onNavigate('chat', dynCards.card1Query)}>
              <div className="w-12 h-12 bg-rose-100/60 rounded-xl flex items-center justify-center text-rose-600 text-2xl shadow-inner">🌴</div>
              <div className="min-w-0">
                <div className="text-2xl font-black text-rose-800 tracking-tight leading-none mb-1">{dynCards.card1Val}</div>
                <div className="text-[10px] font-black uppercase tracking-wider text-rose-600/70 truncate">{dynCards.card1Lbl}</div>
              </div>
            </div>
 
            {/* Stat 2: Tax Statement */}
            <div className="flex items-center gap-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/40 hover:bg-blue-50 hover:scale-[1.01] transition-all cursor-pointer"
                 onClick={() => onNavigate('chat', dynCards.card2Query)}>
              <div className="w-12 h-12 bg-blue-100/60 rounded-xl flex items-center justify-center text-blue-600 text-2xl shadow-inner">📂</div>
              <div className="min-w-0">
                <div className="text-xl font-black text-blue-800 tracking-tight leading-none mb-1 truncate">{dynCards.card2Val}</div>
                <div className="text-[10px] font-black uppercase tracking-wider text-blue-600/70 truncate">{dynCards.card2Lbl}</div>
              </div>
            </div>
 
            {/* Stat 3: Corporate Programs */}
            <div className="flex items-center gap-4 p-4 bg-purple-50/50 rounded-2xl border border-purple-100/40 hover:bg-purple-50 hover:scale-[1.01] transition-all cursor-pointer"
                 onClick={() => onNavigate('chat', dynCards.card3Query)}>
              <div className="w-12 h-12 bg-purple-100/60 rounded-xl flex items-center justify-center text-purple-600 text-2xl shadow-inner">🎁</div>
              <div className="min-w-0">
                <div className="text-lg font-black text-purple-800 tracking-tight leading-none mb-1 truncate">{dynCards.card3Val}</div>
                <div className="text-[10px] font-black uppercase tracking-wider text-purple-600/70 truncate">{dynCards.card3Lbl}</div>
              </div>
            </div>
 
            {/* Stat 4: Office Hotdesks / Career */}
            <div className="flex items-center gap-4 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/40 hover:bg-emerald-50 hover:scale-[1.01] transition-all cursor-pointer"
                 onClick={() => onNavigate('chat', dynCards.card4Query)}>
              <div className="w-12 h-12 bg-emerald-400 text-white rounded-xl flex items-center justify-center text-2xl shadow-inner">🏢</div>
              <div className="min-w-0">
                <div className="text-sm font-black text-slate-800 truncate leading-tight">{dynCards.card4Val}</div>
                <div className="text-[10px] font-bold text-emerald-600 truncate mt-0.5">{dynCards.card4Lbl}</div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 leading-none">Internal Registry</div>
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {(feedSummary || meetingSummary) && (
            <div className="space-y-3">
              {feedSummary && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-primary/5 border border-primary/10 p-4 rounded-xl flex items-center gap-4 shadow-sm"
                >
                  <div className="w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center flex-shrink-0">
                    <Sparkles size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold uppercase text-primary tracking-wider mb-0.5">
                      {t('newsBrief')}
                    </p>
                    <p className="text-xs font-semibold text-primary-dark">
                      "{feedSummary}"
                    </p>
                  </div>
                  <button onClick={() => setFeedSummary(null)} className="p-1.5 text-primary-dark/40 hover:text-primary-dark">
                    <Zap size={14} />
                  </button>
                </motion.div>
              )}
              {meetingSummary && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl flex items-center gap-4 shadow-sm"
                >
                  <div className="w-8 h-8 bg-emerald-500 text-white rounded-lg flex items-center justify-center flex-shrink-0">
                    <Target size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold uppercase text-emerald-600 tracking-wider mb-0.5">
                      {t('meetingsBrief')}
                    </p>
                    <p className="text-xs font-semibold text-emerald-900">
                      "{meetingSummary}"
                    </p>
                  </div>
                  <button onClick={() => setMeetingSummary(null)} className="p-1.5 text-emerald-400 hover:text-emerald-600">
                    <Zap size={14} />
                  </button>
                </motion.div>
              )}
            </div>
          )}
        </AnimatePresence>

        {/* Search Hub with Sidebar Tab Desk */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-8 shadow-sm flex flex-col justify-center relative overflow-hidden h-full min-h-[300px]">
              <div className="absolute top-0 right-0 p-4 transform translate-x-4 -translate-y-4 opacity-5 pointer-events-none">
                <Smile size={180} strokeWidth={1} className="text-primary" />
              </div>

              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                  <Bot size={14} strokeWidth={2.5} />
                </div>
                <h3 className="text-[10px] font-black uppercase text-primary tracking-widest">AI Expert Assistant</h3>
              </div>
              
              <h2 className="text-2xl font-black text-[#1F1F1F] mb-2 leading-tight">
                {t('consoleTitle')}
              </h2>
              <p className="text-slate-500 text-sm font-medium mb-6">
                {t('consoleDesc')}
              </p>
              
              <div className="w-full relative mb-6 z-10 space-y-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      if (quickAnswer) setQuickAnswer(null);
                    }}
                    placeholder={t('searchPlaceholder')}
                    className="w-full py-3.5 pl-11 pr-32 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none text-sm font-medium text-slate-800 placeholder-slate-400 shadow-sm transition-all bg-white-50/50"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        if (searchTerm.length > 5) handleQuickAsk();
                        else onNavigate('chat');
                      }
                    }}
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    {isSearching && <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin mr-1" />}
                    <button 
                      id="quick-ask-btn"
                      onClick={handleQuickAsk}
                      disabled={isQuickAnswering || !searchTerm.trim()}
                      className="bg-primary hover:bg-pink-600 disabled:bg-white-100 disabled:text-slate-300 text-white px-5 py-2 rounded-lg font-extrabold text-xs shadow-sm shadow-black/10 transition-all active:scale-95 flex items-center gap-1.5"
                    >
                      {isQuickAnswering ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Sparkles size={12} />}
                      {t('askBtn')}
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {quickAnswer && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98, y: 10 }}
                      className="absolute top-full left-0 right-0 mt-3 bg-emerald-50 border border-emerald-100 rounded-xl shadow-lg p-5 text-left z-[60] flex flex-col"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[9px] font-bold uppercase text-[#075E54] tracking-wider flex items-center gap-1.5">
                            <Bot size={14} />
                            {t('bestFriendSolution')}
                        </span>
                        <button onClick={() => setQuickAnswer(null)} className="text-[#075E54]/40 hover:text-[#075E54]"><Zap size={12} /></button>
                      </div>
                      <div className="text-[#1F1F1F] font-bold leading-relaxed mb-4 text-sm">
                        {quickAnswer}
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {quickAnswer.toLowerCase().includes('knowledge') && (
                          <button onClick={() => onNavigate('knowledge')} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[9px] font-bold text-slate-700 uppercase tracking-wider hover:bg-slate-50 transition-all">
                            Go to Policy Library →
                          </button>
                        )}
                      </div>

                      <div className="flex gap-2.5 mt-auto">
                        <button 
                          onClick={() => onNavigate('chat', searchTerm)} 
                          className="flex-1 py-2.5 bg-[#128C7E] text-white rounded-lg text-[9px] font-extrabold uppercase tracking-widest shadow-sm hover:bg-[#0e7065] transition-all text-center"
                        >
                          {t('continueConversation')}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex gap-2 flex-wrap">
                {['How are you?', 'VPN Policy', 'Nomad Rule', 'Benefits 2026'].map((chip, idx) => (
                  <button 
                    key={`${chip}-${idx}`}
                    onClick={() => {
                      setSearchTerm(chip);
                      setTimeout(() => {
                        const btn = document.getElementById('quick-ask-btn') as HTMLButtonElement;
                        btn?.click();
                      }, 50);
                    }}
                    className="px-3.5 py-1.5 bg-white-50 hover:bg-primary/5 hover:text-primary text-slate-600 border border-slate-200/60 rounded-lg text-xs font-bold transition-all active:scale-95"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Smart Tab Switcher: Support Desk FAQs vs Onboarding Roadmap checklist */}
          <div className="flex flex-col gap-3">
            <div className="flex bg-white-100 p-1 rounded-xl w-full border border-slate-200/50">
              <button
                onClick={() => setSideTab('faq')}
                className={`flex-1 py-1.5 text-center text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${sideTab === 'faq' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                📚 {t('helpFaqs')}
              </button>
              <button
                onClick={() => setSideTab('onboard')}
                className={`flex-1 py-1.5 text-center text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${sideTab === 'onboard' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                🚀 {t('onboardingTab')}
              </button>
            </div>
            
            <div className="flex-1 h-full min-h-0">
              <AnimatePresence mode="wait">
                {sideTab === 'faq' ? (
                  <motion.div
                    key="faq"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="h-full"
                  >
                    <QuickHelp onAsk={(q) => onNavigate('chat', q)} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="onboard"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="h-full"
                  >
                    <OnboardingGuide region={regions.find(r => r.code === region)?.name || region} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Improved Quick Actions Grid */}
        <section>
          <div className="flex items-center justify-between mb-4">
             <div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-primary mb-0.5">Self-Service Hub</h3>
                <h2 className="text-xl font-bold text-[#1F1F1F]">{t('quickActions')}</h2>
             </div>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <button 
              onClick={() => onNavigate('chat', `I'd like to request PTO for region ${region}`)}
              className="bg-[#E6F2FF]/60 p-5 rounded-2xl text-left hover:bg-[#E6F2FF] transition-all border border-[#E6F2FF]/80"
            >
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl mb-4 shadow-sm">🌴</div>
              <h4 className="font-extrabold text-[#1F1F1F] text-sm">{t('requestPto')}</h4>
              <p className="text-[10px] text-slate-500 font-semibold opacity-80 mt-0.5">{t('ptoBalance')}</p>
            </button>
            
            <button 
              onClick={() => onNavigate('tickets')}
              className="bg-[#F2FFFA]/60 p-5 rounded-2xl text-left hover:bg-[#F2FFFA] transition-all border border-[#F2FFFA]/80"
            >
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl mb-4 shadow-sm">🛠️</div>
              <h4 className="font-extrabold text-[#1F1F1F] text-sm">{t('reportIssue')}</h4>
              <p className="text-[10px] text-slate-500 font-semibold opacity-80 mt-0.5">{t('itFacilitySupport')}</p>
            </button>
            
            <button 
              onClick={() => onNavigate('knowledge')}
              className="bg-[#FFF2E6]/60 p-5 rounded-2xl text-left hover:bg-[#FFF2E6] transition-all border border-[#FFF2E6]/80"
            >
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl mb-4 shadow-sm">💰</div>
              <h4 className="font-extrabold text-[#1F1F1F] text-sm">{t('fileExpense')}</h4>
              <p className="text-[10px] text-slate-500 font-semibold opacity-80 mt-0.5">{t('sapConcur')}</p>
            </button>
            
            <button 
              onClick={() => onNavigate('chat', 'How do I book a desk in my office?')}
              className="bg-[#F8F9FF]/60 p-5 rounded-2xl text-left hover:bg-[#F8F9FF] transition-all border border-[#F8F9FF]/80"
            >
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl mb-4 shadow-sm">🏢</div>
              <h4 className="font-extrabold text-[#1F1F1F] text-sm">{t('bookDesk')}</h4>
              <p className="text-[10px] text-slate-500 font-semibold opacity-80 mt-0.5">{t('officeHubSeats')}</p>
            </button>
          </div>
        </section>

        {/* Directory Categories Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
             <div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-[#1F1F1F]/40 mb-1">{t('corporateArchives')}</h3>
                <h2 className="text-xl font-bold text-[#1F1F1F]">{t('exploreDirectories')}</h2>
             </div>
          </div>
          <div className="grid grid-cols-2 gap-4 pb-12">
            {categories.map((cat) => (
              <button
                key={cat.label}
                onClick={() => onNavigate(cat.key)}
                className="bg-white p-4 rounded-xl border border-slate-100 hover:border-primary/30 transition-all text-left flex items-center gap-4 group shadow-sm"
              >
                <div className={`w-10 h-10 ${cat.color || 'bg-slate-100'} rounded-lg flex items-center justify-center text-xl group-hover:scale-105 transition-transform flex-shrink-0`}>
                  {cat.icon === 'tickets' ? '🎫' : cat.icon}
                </div>
                <div className="min-w-0">
                  <h3 className="font-extrabold text-sm text-[#1F1F1F] truncate">{cat.label}</h3>
                  <p className="text-[10px] text-slate-405 font-bold truncate">{cat.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* Right Feed Panel */}
      <div className="w-[340px] bg-white border-l border-slate-100 p-10 flex flex-col gap-8 h-full relative">
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div className="mb-10">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center justify-between">
              Internal Feed
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse delay-75" />
              </div>
            </h3>
            <div className="space-y-4">
              {recentFeed.map((item, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={`${item.id}-${idx}`} 
                  className={`p-5 rounded-[24px] shadow-sm flex flex-col gap-1 border-l-[6px] hover:scale-[1.02] transition-transform cursor-default ${
                    idx % 2 === 0 ? 'bg-[#F8F9FF] border-[#4D77FF]' : 'bg-[#F2FFFA] border-[#20C997]'
                  }`}
                >
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-2">
                    {item.type}
                  </p>
                  <h4 className="font-black text-sm text-[#1F1F1F] leading-snug">{item.title}</h4>
                  <div className="text-[10px] text-slate-500 font-bold mt-1 tracking-tight italic opacity-60">Verified Post • Just now</div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Pinned Policy</h3>
            <div className="bg-peach rounded-[32px] p-6 shadow-sm border border-peach-light relative overflow-hidden group">
               <div className="absolute -right-4 -top-4 text-primary/10 rotate-12 transition-transform group-hover:rotate-45">
                 <Target size={120} />
               </div>
               <div className="bg-[#FFB300] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-md w-fit mb-3 relative z-10">Updated</div>
               <h4 className="font-black text-md text-[#1F1F1F] mb-2 leading-tight relative z-10">New Joiner Guide</h4>
               <p className="text-[11px] text-slate-600 font-medium leading-relaxed mb-4 relative z-10 italic">
                 "Complete your first 30 days of onboarding through the interactive guide on your dashboard..."
               </p>
               <button 
                onClick={() => onNavigate('knowledge')}
                className="text-[11px] font-black text-primary hover:text-primary-dark transition-colors flex items-center gap-1 relative z-10"
               >
                 Read Full Doc <ArrowRight size={12} strokeWidth={3} />
               </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0">
        <TechTicker />
      </div>
    </div>
  );
}
