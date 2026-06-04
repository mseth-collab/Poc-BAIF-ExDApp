/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ChatInterface } from './components/ChatInterface';
import { KnowledgeBase } from './components/KnowledgeBase';
import { OrgFeed } from './components/OrgFeed';
import { SupportTickets } from './components/SupportTickets';
import { AIHub } from './components/AIHub';
import { Directory } from './components/Directory';
import { CommandPalette } from './components/CommandPalette';
import { HeaderBar } from './components/HeaderBar';
import { EmployeeProvider, useEmployee, BOT_AVATARS } from './components/EmployeeContext';
import { AnimatePresence, motion } from 'motion/react';
import { Home, Smile, BookOpen, Ticket, Sparkles, Laptop, Phone } from 'lucide-react';

/** Subtle floating IT / enterprise logos for corporate portal feel */
const FLOATING_PARTNERS = [
  { name: 'Microsoft', x: '8%', y: '12%', delay: 0, size: 'text-sm' },
  { name: 'AWS', x: '78%', y: '8%', delay: 1.2, size: 'text-xs' },
  { name: 'Google Cloud', x: '62%', y: '22%', delay: 0.6, size: 'text-xs' },
  { name: 'SAP', x: '18%', y: '38%', delay: 2, size: 'text-sm' },
  { name: 'Oracle', x: '85%', y: '45%', delay: 0.9, size: 'text-xs' },
  { name: 'IBM', x: '42%', y: '55%', delay: 1.5, size: 'text-sm' },
  { name: 'Cisco', x: '12%', y: '68%', delay: 0.3, size: 'text-xs' },
  { name: 'ServiceNow', x: '72%', y: '62%', delay: 1.8, size: 'text-xs' },
  { name: 'Salesforce', x: '48%', y: '78%', delay: 1.1, size: 'text-xs' },
  { name: 'Exadel', x: '88%', y: '28%', delay: 0.4, size: 'text-sm' },
];

function CorporateTechBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {/* Light white → mint green wash */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-emerald-50/80 to-green-100/60" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(16,185,129,0.12),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(52,211,153,0.10),transparent_50%)]" />

      {/* Soft grid */}
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(16,185,129,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.06) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Floating partner badges */}
      {FLOATING_PARTNERS.map((partner) => (
        <motion.div
          key={partner.name}
          className={`absolute ${partner.size} font-black uppercase tracking-widest text-emerald-700/20 select-none`}
          style={{ left: partner.x, top: partner.y }}
          animate={{ y: [0, -10, 0], opacity: [0.18, 0.28, 0.18] }}
          transition={{
            duration: 8 + partner.delay,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: partner.delay,
          }}
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-200/40 bg-white/40 backdrop-blur-[2px] shadow-sm">
            {partner.name}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

function AppLayout() {
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isSidebarMobileOpen, setIsSidebarMobileOpen] = useState(false);
  const [isWindowMobile, setIsWindowMobile] = useState(false);
  const [showDemoOffer, setShowDemoOffer] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const employeeContext = useEmployee();
  const { region, setRegion } = employeeContext;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!sessionStorage.getItem('demo-offer-dismissed')) setShowDemoOffer(true);
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleResize = () => setIsWindowMobile(window.innerWidth < 480);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const currentTab = location.pathname.substring(1) || 'home';
  const currentQuery = searchParams.get('query') || '';

  useEffect(() => {
    const urlCountry = searchParams.get('country');
    if (urlCountry && urlCountry !== region) setRegion(urlCountry);
  }, [searchParams]);

  useEffect(() => {
    const urlCountry = searchParams.get('country');
    if (region && urlCountry !== region) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set('country', region);
      navigate({ pathname: location.pathname, search: `?${newParams.toString()}` }, { replace: true });
    }
  }, [region, location.pathname, searchParams, navigate]);

  const onNavigate = (tab: string, queryParam?: string) => {
    const params = new URLSearchParams();
    if (queryParam) params.set('query', queryParam);
    params.set('country', region);
    navigate(`/${tab}?${params.toString()}`);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isMobileMode = employeeContext.interfaceMode === 'mobile';

  const mobileMenuItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'chat', icon: Smile, label: 'FrAIend' },
    { id: 'knowledge', icon: BookOpen, label: 'Policies' },
    { id: 'tickets', icon: Ticket, label: 'Tickets' },
    { id: 'ai-hub', icon: Sparkles, label: 'AI Hub' },
  ];

  /* ── Mobile simulator layout ── */
  if (isMobileMode && !isWindowMobile) {
    return (
      <div className="relative min-h-screen overflow-y-auto">
        <CorporateTechBackdrop />
        <div className="relative z-10 flex flex-col items-center justify-center p-6 lg:p-12 min-h-screen">
          <div className="flex flex-col xl:flex-row items-center justify-center gap-10 max-w-6xl w-full">
            <div className="w-full xl:w-80 bg-white/90 border border-emerald-100 backdrop-blur-xl rounded-3xl p-6 shadow-xl flex flex-col gap-6 select-none">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <h3 className="text-[10px] font-black text-emerald-700/70 uppercase tracking-widest">Interactive Studio</h3>
                </div>
                <h2 className="text-2xl font-black text-slate-900">BestFrAIend Hub</h2>
                <p className="text-xs text-slate-500 mt-2">Corporate light theme · white &amp; green workspace.</p>
              </div>

              <div className="space-y-2.5">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Device Render Engine</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => employeeContext.setInterfaceMode('web')}
                    className="px-3 py-3 rounded-xl border-2 border-slate-200 bg-white hover:border-emerald-200 text-xs font-bold flex flex-col items-center gap-1.5 text-slate-600"
                  >
                    <Laptop size={14} />
                    <span>Desktop Web</span>
                  </button>
                  <button
                    onClick={() => employeeContext.setInterfaceMode('mobile')}
                    className="px-3 py-3 rounded-xl border-2 border-emerald-400 bg-emerald-50 text-emerald-700 text-xs font-bold flex flex-col items-center gap-1.5"
                  >
                    <Phone size={14} />
                    <span>Mobile App</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {BOT_AVATARS.map((avatar) => (
                  <button
                    key={avatar.id}
                    onClick={() => employeeContext.setBotAvatar(avatar.url)}
                    className={`w-full p-2.5 rounded-xl border-2 text-left flex items-center gap-3 ${
                      employeeContext.botAvatar === avatar.url
                        ? 'border-emerald-400 bg-emerald-50'
                        : 'border-slate-200 bg-white/80'
                    }`}
                  >
                    <img src={avatar.url} alt={avatar.name} className="w-10 h-10 rounded-lg object-cover bg-slate-100" referrerPolicy="no-referrer" />
                    <div className="min-w-0">
                      <p className="text-xs font-black truncate">{avatar.name}</p>
                      <p className="text-[9px] text-slate-400 truncate">{avatar.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="w-[375px] h-[812px] rounded-[52px] border-[12px] border-slate-800 shadow-2xl relative overflow-hidden bg-white flex flex-col shrink-0">
              {/* phone internals unchanged — same Routes as your original */}
              <div className="flex-1 flex flex-col min-h-0 relative bg-white">
                <div className="h-14 border-b border-emerald-100 px-4 flex items-center justify-between bg-white/95">
                  <span className="text-xs font-black uppercase text-emerald-600">BestFrAIend</span>
                  <div className="text-xs bg-emerald-50 border border-emerald-100 p-1 rounded-lg font-black text-slate-700">
                    {employeeContext.currentRegionDetail.flag}{' '}
                    <span className="uppercase text-[9px]">{employeeContext.region}</span>
                  </div>
                </div>
                <div className="flex-1 overflow-hidden relative">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={location.pathname + location.search}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="h-full overflow-y-auto"
                    >
                      <Routes>
                        <Route path="/" element={<Navigate to="/home" replace />} />
                        <Route path="/home" element={<Dashboard onNavigate={onNavigate} employeeContext={employeeContext} />} />
                        <Route path="/chat" element={<ChatInterface initialQuery={currentQuery} onNavigate={onNavigate} employeeContext={employeeContext} />} />
                        <Route path="/knowledge" element={<KnowledgeBase onNavigate={onNavigate} employeeContext={employeeContext} />} />
                        <Route path="/tickets" element={<SupportTickets onNavigate={onNavigate} employeeContext={employeeContext} />} />
                        <Route path="/ai-hub" element={<AIHub onNavigate={onNavigate} employeeContext={employeeContext} />} />
                        <Route path="/feed" element={<OrgFeed onNavigate={onNavigate} employeeContext={employeeContext} />} />
                        <Route path="/people" element={<Directory onNavigate={onNavigate} employeeContext={employeeContext} />} />
                        <Route path="*" element={<Navigate to="/home" replace />} />
                      </Routes>
                    </motion.div>
                  </AnimatePresence>
                </div>
                <div className="h-16 border-t border-emerald-100 bg-white px-4 flex items-center justify-between">
                  {mobileMenuItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => onNavigate(item.id)}
                      className={`flex flex-col items-center flex-1 py-1 ${currentTab === item.id ? 'text-emerald-600 font-black' : 'text-slate-400 font-bold'}`}
                    >
                      <item.icon size={18} />
                      <span className="text-[10px] mt-1">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} onNavigate={(tab, q) => onNavigate(tab, q)} />
        </div>
      </div>
    );
  }

  /* ── Desktop layout — light white + green corporate theme ── */
  return (
    <div className="relative flex h-screen font-sans overflow-hidden selection:bg-emerald-200/50 selection:text-emerald-900">
      <CorporateTechBackdrop />

      <AnimatePresence>
        {isSidebarMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-emerald-950/30 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsSidebarMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {!isMobileMode && (
        <aside
          className={`fixed inset-y-0 left-0 z-50 lg:relative lg:z-10 transform transition-transform duration-300 w-64 flex-shrink-0 h-full
            ${isSidebarMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        >
          <Sidebar
            activeTab={currentTab}
            setActiveTab={(tab) => {
              onNavigate(tab);
              setIsSidebarMobileOpen(false);
            }}
          />
        </aside>
      )}

      <div className="relative z-10 flex-1 flex flex-col h-full overflow-hidden bg-white/75 backdrop-blur-[2px] border-l border-emerald-100/80">
        <HeaderBar onToggleSidebar={() => setIsSidebarMobileOpen(!isSidebarMobileOpen)} />

        <main className="flex-1 overflow-hidden relative bg-white/55 pb-[70px] md:pb-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname + location.search}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className="h-full overflow-y-auto"
            >
              <Routes>
                <Route path="/" element={<Navigate to="/home" replace />} />
                <Route path="/home" element={<Dashboard onNavigate={onNavigate} employeeContext={employeeContext} />} />
                <Route path="/chat" element={<ChatInterface initialQuery={currentQuery} onNavigate={onNavigate} employeeContext={employeeContext} />} />
                <Route path="/knowledge" element={<KnowledgeBase onNavigate={onNavigate} employeeContext={employeeContext} />} />
                <Route path="/tickets" element={<SupportTickets onNavigate={onNavigate} employeeContext={employeeContext} />} />
                <Route path="/ai-hub" element={<AIHub onNavigate={onNavigate} employeeContext={employeeContext} />} />
                <Route path="/feed" element={<OrgFeed onNavigate={onNavigate} employeeContext={employeeContext} />} />
                <Route path="/people" element={<Directory onNavigate={onNavigate} employeeContext={employeeContext} />} />
                <Route path="*" element={<Navigate to="/home" replace />} />
              </Routes>
            </motion.div>
          </AnimatePresence>

          <CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} onNavigate={(tab, q) => onNavigate(tab, q)} />

          <button
            onClick={() => setIsCommandOpen(true)}
            className="fixed bottom-10 right-10 w-14 h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-xl shadow-emerald-900/20 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 group"
            title="Search (⌘K)"
          >
            <div className="absolute -top-12 right-0 bg-white border border-emerald-100 px-3 py-1.5 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-black text-emerald-700 whitespace-nowrap">
              Cmd + K to Search
            </div>
            <motion.div animate={{ rotate: isCommandOpen ? 90 : 0 }}>
              {isCommandOpen ? (
                <span className="text-2xl font-black">×</span>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              )}
            </motion.div>
          </button>
        </main>

        {isWindowMobile && (
          <div className="fixed bottom-0 inset-x-0 h-16 border-t border-emerald-100 bg-white/95 backdrop-blur-md px-4 flex items-center justify-between z-40 shadow-[0_-5px_15px_-5px_rgba(16,185,129,0.08)]">
            {mobileMenuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex flex-col items-center flex-1 py-1 ${currentTab === item.id ? 'text-emerald-600 font-black' : 'text-slate-400 font-bold'}`}
              >
                <item.icon size={18} strokeWidth={currentTab === item.id ? 3 : 2} />
                <span className="text-[10px] mt-1">{item.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Demo persona toast — unchanged logic */}
      <AnimatePresence>
        {showDemoOffer && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-[460px] bg-white/95 backdrop-blur-md border-2 border-emerald-200 rounded-2xl shadow-2xl p-5 z-50"
          >
            <div className="flex items-start justify-between">
              <span className="text-[9px] uppercase font-black tracking-widest text-emerald-600">Global Differentiation Story</span>
              <button
                onClick={() => {
                  setShowDemoOffer(false);
                  sessionStorage.setItem('demo-offer-dismissed', 'true');
                }}
                className="text-slate-400 hover:text-slate-600 text-xs font-black px-2 py-1 bg-slate-50 rounded-lg"
              >
                Dismiss
              </button>
            </div>
            <h4 className="text-sm font-black text-slate-800 mt-2">
              One portal, <span className="text-emerald-600">different answers</span>.
            </h4>
            <div className="grid grid-cols-2 gap-2 mt-3">
              {employeeContext.personas.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    employeeContext.setActivePersonaId(p.id);
                    setShowDemoOffer(false);
                    sessionStorage.setItem('demo-offer-dismissed', 'true');
                  }}
                  className={`px-3 py-2 border rounded-xl text-left text-xs ${
                    employeeContext.activePersonaId === p.id
                      ? 'border-emerald-400 bg-emerald-50 font-extrabold'
                      : 'border-slate-200 bg-white font-bold text-slate-700'
                  }`}
                >
                  <div className="flex justify-between">
                    <span>{p.name.split(' ')[0]}</span>
                    <span>{p.flag}</span>
                  </div>
                  <div className="text-[8px] text-slate-400 uppercase">{p.country}</div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <EmployeeProvider>
      <AppLayout />
    </EmployeeProvider>
  );
}