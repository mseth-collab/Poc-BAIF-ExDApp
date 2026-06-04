/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Home, MessageSquare, BookOpen, Newspaper, Users, Info, Ticket, Sparkles, Smile } from 'lucide-react';
import { motion } from 'motion/react';
import { useEmployee } from './EmployeeContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const { employee, t, theme, personas, activePersonaId, setActivePersonaId } = useEmployee();

  // In production, we keep Coming Soon features flagged Off. Change to true in staging.
  const SHOW_COMING_SOON_TABS = false;

  const menuItems = [
    { id: 'home', icon: Home, label: t('dashboard') },
    { id: 'chat', icon: Smile, label: t('chat') },
    { id: 'knowledge', icon: BookOpen, label: t('policyLibrary') },
    { id: 'tickets', icon: Ticket, label: t('openTickets') },
    { id: 'ai-hub', icon: Sparkles, label: t('aiHub') },
    { id: 'feed', icon: Newspaper, label: t('orgFeed') },
    { id: 'people', icon: Users, label: t('directory') },
    { id: 'billing', icon: Info, label: 'Finance Hub [Beta]', comingSoon: true },
    { id: 'transcripts', icon: MessageSquare, label: 'AI Transcripts Desk', comingSoon: true },
  ].filter(item => !item.comingSoon || SHOW_COMING_SOON_TABS);

  // Get name initials for the avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <aside className="w-full bg-slate-50 border-r border-slate-200/80 text-slate-800 flex flex-col h-full overflow-hidden transition-all duration-200 selection:bg-primary/20 selection:text-primary">
      <div className="p-8">
        <div className="flex items-center gap-3 mb-10 select-none">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-black text-2xl shadow-sm border border-primary/20 flex-shrink-0">
            <Smile size={30} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-slate-900 font-extrabold text-xl leading-none tracking-tight">BestFrAIend</h1>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black block mt-1">Internal Portal</span>
          </div>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm font-black ${
                activeTab === item.id 
                  ? 'bg-primary/10 text-primary border border-primary/10 font-extrabold shadow-sm' 
                  : 'hover:bg-slate-100/80 text-slate-650 hover:text-slate-900'
              }`}
            >
              <item.icon size={18} strokeWidth={2.5} />
              <span className="truncate">{item.label}</span>
              {activeTab === item.id && (
                <motion.div 
                  layoutId="indicator" 
                  className="ml-auto w-1.5 h-1.5 bg-primary rounded-full" 
                />
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 space-y-4">
        {/* Dynamic Context Card */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200/60 shadow-sm">
          <div className="flex items-center gap-2 mb-2 select-none">
            <Info size={14} className="text-primary bg-primary/5 rounded p-0.5" />
            <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider font-extrabold">{t('dynamicHelp')}</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed font-bold">
            Logged in from <span className="uppercase text-primary font-black">{employee.region}</span>. Inquiring yields custom local parameters.
          </p>
        </div>
        
        {/* Current Demo Persona Profile */}
        <div className="flex items-center gap-3 px-2 py-3 border-t border-slate-200/80 pt-4">
          <div className="w-10 h-10 rounded-xl bg-primary text-white font-black text-xs flex items-center justify-center border border-primary/20 flex-shrink-0 shadow-sm">
            {getInitials(employee.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black text-slate-800 truncate leading-none mb-1">{employee.name}</p>
            <p className="text-[10px] text-slate-400 font-bold truncate">{employee.role}</p>
          </div>
        </div>
      </div>

      <div className="px-6 pb-6 select-none">
        <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-550/15 flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase text-emerald-650 tracking-wider leading-none">Active Regional Vault</p>
            <p className="text-[8px] font-black text-emerald-550 mt-1 truncate">{employee.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
