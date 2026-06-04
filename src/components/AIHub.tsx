/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import {
  Sparkles, Zap, ArrowRight, Target, Calendar, MapPin, Share2, ThumbsUp, Clock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AIInitiative } from '../types';
import { WeeklyAIDigest } from './WeeklyAIDigest';
import { useEmployee } from './EmployeeContext';

interface AIHubProps {
  onNavigate?: (tab: string, query?: string) => void;
  employeeContext?: unknown;
}

const LIVE_ACTIVITIES = [
  { text: 'Lukasz J. (Warsaw Hub) just registered for Warsaw Spire Prompt-thon', time: 'Just now' },
  { text: 'Oleksandr K. (Kyiv Hub) upvoted UA wellbeing resources template', time: '2 mins ago' },
  { text: 'Jane D. (US Node) joined open enrollment benefits briefing', time: '5 mins ago' },
  { text: 'Sophie L. (Toronto Hub) submitted RRSP matching question', time: '8 mins ago' },
  { text: 'Elena W. (Berlin Node) started EU payroll office hours', time: '12 mins ago' },
];

const HUB_NODES = [
  { code: 'PL', name: 'Warsaw Spire Hub', coordinator: 'Anna Kowalska', timezone: 'CET (UTC+1)', ping: '12ms' },
  { code: 'UA', name: 'Kyiv Virtual Hub', coordinator: 'Oleksandr Klymenko', timezone: 'EET (UTC+2)', ping: '22ms' },
  { code: 'US', name: 'Silicon Valley Hub', coordinator: 'Mark Thompson', timezone: 'PST (UTC-8)', ping: '45ms' },
  { code: 'CA', name: 'Toronto Virtual Hub', coordinator: 'Sophie Laurent', timezone: 'EST (UTC-5)', ping: '38ms' },
  { code: 'HR', name: 'Zagreb Matrix Hub', coordinator: 'Marko Horvat', timezone: 'CET (UTC+1)', ping: '18ms' },
  { code: 'DE', name: 'Berlin Node', coordinator: 'Elena Wagner', timezone: 'CET (UTC+1)', ping: '14ms' },
  { code: 'Global', name: 'Global Virtual Summit', coordinator: 'Exadel Admin', timezone: 'GMT (UTC+0)', ping: '5ms' },
];

const IDEA_TEMPLATES = [
  {
    key: 'rag',
    title: 'RAG Knowledge Sync',
    category: 'Information Retrieval',
    draftName: 'Smart Document Auditor',
    draftDesc: 'Allow regional HR leads to upload policy PDFs with secure compliance checks in Q&A.',
    benefit: 'Saves hours per file by parsing metadata and location overrides automatically.',
  },
  {
    key: 'slack',
    title: 'Custom Slack Agent',
    category: 'Daily Workflows',
    draftName: 'Exadel Slack Sync Agent',
    draftDesc: 'Slash commands fetching standard answers from the regional archive.',
    benefit: 'Reduces repetitive HR and IT tickets in workspace channels.',
  },
  {
    key: 'eval',
    title: 'Secure Llama Guard',
    category: 'Safety & GDPR',
    draftName: 'PII Scrubbing Proxy',
    draftDesc: 'Gateway that redacts customer IDs before routing to external LLMs.',
    benefit: 'Lower risk of leaking internal salary or customer data.',
  },
];

const ACTIVE_USERS: Record<string, string> = {
  PL: '142',
  UA: '89',
  US: '185',
  CA: '54',
  HR: '68',
  DE: '41',
  Global: '312',
};

export function AIHub({ onNavigate }: AIHubProps = {}) {
  const { region, language, activePersona, currentRegionDetail } = useEmployee();

  const [initiatives, setInitiatives] = useState<AIInitiative[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'my' | 'all'>('my');
  const [selectedHub, setSelectedHub] = useState(region);
  const [registeredEvents, setRegisteredEvents] = useState<Record<string, boolean>>({});
  const [liveActivities, setLiveActivities] = useState(LIVE_ACTIVITIES);

  const [pollVoted, setPollVoted] = useState(false);
  const [pollSelection, setPollSelection] = useState('');
  const [pollVotes, setPollVotes] = useState({ playground: 34, voice: 18, filegen: 45, visualflow: 22 });

  const [proposals, setProposals] = useState<any[]>(() => {
    const saved = localStorage.getItem('user-ai-proposals');
    return saved ? JSON.parse(saved) : [
      {
        id: 'prop_1',
        title: 'Copernicus Meeting Summarizer',
        description: 'Auto-summarize client calls for PL teams.',
        category: 'Information Retrieval',
        benefit: 'Reduce briefing time in Warsaw by 50%.',
        upvotes: 14,
        status: 'sandbox_ready',
        author: 'Marek K. (PL)',
      },
    ];
  });

  const [activeTemplate, setActiveTemplate] = useState('');
  const [ideaTitle, setIdeaTitle] = useState('');
  const [ideaDesc, setIdeaDesc] = useState('');
  const [ideaBenefit, setIdeaBenefit] = useState('');
  const [ideaResult, setIdeaResult] = useState<string | null>(null);

  // When user changes region (header or persona), reset hub view
  useEffect(() => {
    setSelectedHub(region);
    setActiveTab('my');
  }, [region]);

  useEffect(() => {
    localStorage.setItem('user-ai-proposals', JSON.stringify(proposals));
  }, [proposals]);

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/ai-hub?language=${language}&region=${region}`)
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data.initiatives || [];
        setInitiatives(list);
      })
      .catch(() => setInitiatives([]))
      .finally(() => setIsLoading(false));
  }, [language, region]);

  useEffect(() => {
    const interval = setInterval(() => {
      const names = ['Beata Z.', 'Dragan M.', 'Fritz H.', 'Mark T.', 'Nora L.', 'Sarah P.'];
      const locations = ['PL', 'UA', 'US', 'CA', 'HR', 'DE'];
      const randomName = names[Math.floor(Math.random() * names.length)];
      const randomLoc = locations[Math.floor(Math.random() * locations.length)];
      const alerts = [
        `registered for the upcoming ${randomLoc} AI event`,
        `upvoted a compliance template for Node: ${randomLoc}`,
        `submitted a new micro-agent sandbox proposal`,
      ];
      const randomAlert = alerts[Math.floor(Math.random() * alerts.length)];
      setLiveActivities((prev) => [
        { text: `${randomName} (${randomLoc} Node) ${randomAlert}`, time: 'Just now' },
        ...prev.slice(0, 4),
      ]);
    }, 8500);
    return () => clearInterval(interval);
  }, []);

  const selectTemplate = (key: string) => {
    const tmpl = IDEA_TEMPLATES.find((t) => t.key === key);
    if (tmpl) {
      setActiveTemplate(key);
      setIdeaTitle(tmpl.draftName);
      setIdeaDesc(tmpl.draftDesc);
      setIdeaBenefit(tmpl.benefit);
    }
  };

  const handleVote = (option: 'playground' | 'voice' | 'filegen' | 'visualflow') => {
    if (pollVoted) return;
    setPollVotes((prev) => ({ ...prev, [option]: prev[option] + 1 }));
    setPollSelection(option);
    setPollVoted(true);
  };

  const handleCreateProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ideaTitle.trim()) return;
    const newProp = {
      id: 'prop_' + Date.now(),
      title: ideaTitle,
      description: ideaDesc || 'A secure full-stack workflow integration.',
      category: IDEA_TEMPLATES.find((t) => t.key === activeTemplate)?.category || 'General AI Boost',
      benefit: ideaBenefit || 'Provides optimized workspace efficiency.',
      upvotes: 1,
      status: 'under_review',
      author: `You (${region})`,
    };
    setProposals((prev) => [newProp, ...prev]);
    setIdeaResult('Successfully shared draft proposal!');
    setTimeout(() => {
      setIdeaResult(null);
      setActiveTemplate('');
      setIdeaTitle('');
      setIdeaDesc('');
      setIdeaBenefit('');
    }, 4000);
  };

  const upvoteProposal = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setProposals((prev) =>
      prev.map((p) => (p.id === id ? { ...p, upvotes: p.upvotes + 1 } : p)),
    );
  };

  const toggleRegister = (id: string) => {
    setRegisteredEvents((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const totalPollVotes =
    pollVotes.playground + pollVotes.voice + pollVotes.filegen + pollVotes.visualflow;

  const activeHub = HUB_NODES.find((h) => h.code === selectedHub) || HUB_NODES[0];

  const hubEvents = initiatives.filter(
    (i) => i.type === 'event' && (i.region === selectedHub || i.region === 'Global'),
  );

  const getCoordinatorMessage = () => {
    if (pollSelection === 'playground') {
      return `💬 ${activeHub.coordinator} says: "We are experimenting with isolated sandboxes in ${selectedHub} already."`;
    }
    if (pollSelection === 'filegen') {
      return `💬 ${activeHub.coordinator} says: "Secure document printing is our #1 priority for ${selectedHub}."`;
    }
    return `💬 ${activeHub.coordinator} says: "Thanks for voting — we'll share ${selectedHub} rollout plans soon."`;
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start justify-between gap-6 p-6 bg-white border-2 border-slate-100 rounded-[28px] shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-14 h-14 bg-gradient-to-tr from-primary to-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <Sparkles size={26} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight italic">AI Innovation Hub</h2>
              <p className="text-xs text-slate-500 font-bold mt-0.5">
                Exadel internal hub for AI sandbox, events, and location node sync.
              </p>
            </div>
          </div>
          {/* Visible region + persona */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className="inline-flex items-center gap-1.5 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-full text-xs font-black text-slate-900">
              {currentRegionDetail.flag} {currentRegionDetail.name} · {region}
            </span>
            <span className="text-[10px] text-slate-500 font-bold">
              Viewing as {activePersona.name} ({activePersona.role})
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full font-black uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Active Sync · {region}
        </div>
      </div>

      {/* Live ticker */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-4 overflow-hidden">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
        </span>
        <AnimatePresence mode="wait">
          <motion.div
            key={liveActivities[0]?.text}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="text-xs font-black text-slate-700 flex-1 truncate"
          >
            ⚡ LIVE: {liveActivities[0]?.text}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Region-specific digest — updates when region changes */}
      <WeeklyAIDigest region={region} language={language} />

      {/* Events by location */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-md">
              Live Scheduling
            </span>
            <h3 className="text-3xl font-black text-slate-900 mt-2">📍 AI Events by Location</h3>
          </div>
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => {
                setActiveTab('my');
                setSelectedHub(region);
              }}
              className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${
                activeTab === 'my' ? 'bg-white text-primary shadow-sm' : 'text-slate-500'
              }`}
            >
              My Hub ({region})
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${
                activeTab === 'all' ? 'bg-white text-primary shadow-sm' : 'text-slate-500'
              }`}
            >
              Explore Node Deck
            </button>
          </div>
        </div>

        {activeTab === 'all' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
            {HUB_NODES.map((node) => (
              <button
                key={node.code}
                onClick={() => setSelectedHub(node.code)}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${
                  selectedHub === node.code
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-md'
                    : 'border-slate-100 bg-white hover:border-slate-200'
                }`}
              >
                <span className="text-sm font-black text-slate-800">{node.code}</span>
                <h5 className="text-[11px] font-black text-slate-900 mt-2 leading-tight truncate">{node.name}</h5>
                <div className="flex items-center gap-1 text-[9px] text-slate-400 font-bold mt-1">
                  <Clock size={10} /> {node.ping}
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="bg-slate-50 border border-slate-200 p-5 rounded-[24px] grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-4">
            <div>
              <span className="text-[9px] uppercase font-black tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                Active Focal Point
              </span>
              <h4 className="text-xl font-black text-slate-900 mt-1.5">{activeHub.name}</h4>
              <p className="text-[10px] text-slate-500 font-bold uppercase">
                Status: <span className="text-emerald-600">● LIVE SYNCED</span>
              </p>
            </div>
            <div className="space-y-2 text-[11px]">
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-400 font-bold">Coordinator:</span>
                <span className="font-bold text-slate-800">{activeHub.coordinator}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-400 font-bold">Timezone:</span>
                <span className="font-bold text-slate-800">{activeHub.timezone}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-400 font-bold">Database:</span>
                <span className="font-mono font-bold text-slate-600">exadel-{selectedHub.toLowerCase()}-node</span>
              </div>
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-xl">
              <span className="text-[9px] font-black uppercase text-primary">Active Hub Users</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-base font-black text-slate-800">
                  {ACTIVE_USERS[selectedHub] || '—'}
                </span>
                <span className="text-[9px] text-slate-400 font-semibold">employees active today</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-[10px] uppercase font-black text-slate-400">Events on site</span>
              <span className="text-xs text-primary font-black uppercase">{selectedHub} Hub Catalog</span>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-24 bg-white rounded-2xl animate-pulse border border-slate-100" />
                ))}
              </div>
            ) : hubEvents.length === 0 ? (
              <div className="py-12 text-center bg-white rounded-3xl border border-slate-200">
                <p className="text-slate-500 font-bold text-sm">
                  No events for {selectedHub} yet. Try another node or check Global events.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[320px] overflow-y-auto">
                {hubEvents.map((event) => (
                  <div
                    key={event.id}
                    className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-primary/30 flex flex-col sm:flex-row justify-between sm:items-center gap-3"
                  >
                    <div className="min-w-0">
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-primary/10 text-primary">
                        {event.region === 'Global' ? '🌍 Global' : `📍 ${event.region}`}
                      </span>
                      <h5 className="text-sm font-black text-slate-900 mt-1 truncate">{event.title}</h5>
                      <p className="text-xs text-slate-500 truncate">{event.description}</p>
                      <div className="flex gap-4 text-[11px] text-slate-500 font-bold mt-1">
                        <span className="flex items-center gap-1"><Calendar size={11} /> {event.date}</span>
                        <span className="flex items-center gap-1"><MapPin size={11} /> {event.location}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleRegister(event.id)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase shrink-0 ${
                        registeredEvents[event.id]
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-primary text-white hover:bg-primary-dark'
                      }`}
                    >
                      {registeredEvents[event.id] ? '✓ Registered' : 'Book Seat'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Poll + Sandbox — shortened; keep your existing blocks or paste from original */}
      {/* ... rest of poll, proposal sandbox, community wall unchanged ... */}

    </div>
  );
}