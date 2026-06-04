/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { useEmployee } from './EmployeeContext';
import { Ticket, Clock, CheckCircle2, MessageSquare, Send, Search, User, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SupportTicket } from '../types';

interface SupportTicketsProps {
  onNavigate?: (tab: string, query?: string) => void;
  employeeContext?: any;
}

export function SupportTickets({ onNavigate, employeeContext }: SupportTicketsProps = {}) {
  const { t, language } = useEmployee();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSlacking, setIsSlacking] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/tickets?language=${language}`)
      .then(res => res.json())
      .then(data => {
        setTickets(data);
        setIsLoading(false);
      });
  }, [language]);

  const handleSlack = (ticketId: string) => {
    setIsSlacking(ticketId);
    setTimeout(() => {
      setIsSlacking(null);
      setSuccessMessage(`Slack reminder sent to assignee for Ticket #${ticketId}! 💬`);
      setTimeout(() => {
        setSuccessMessage(null);
      }, 4000);
    }, 1500);
  };

  const getStatusStyle = (status: SupportTicket['status']) => {
    switch (status) {
      case 'open': return 'bg-rose-100 text-rose-600 border-rose-200';
      case 'in-progress': return 'bg-amber-100 text-amber-600 border-amber-200';
      case 'resolved': return 'bg-emerald-100 text-emerald-600 border-emerald-200';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="p-10 max-w-5xl mx-auto space-y-10 relative">
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="p-4 bg-slate-900 border border-slate-800 text-emerald-400 rounded-2xl flex items-center gap-3 shadow-2xl text-xs font-black uppercase tracking-wider sticky top-4 z-50 justify-between"
          >
            <div className="flex items-center gap-2">
              <Check size={16} strokeWidth={3} className="text-emerald-400 bg-emerald-400/10 rounded p-0.5" />
              <span>{successMessage}</span>
            </div>
            <button onClick={() => setSuccessMessage(null)} className="text-[10px] text-slate-400 hover:text-white uppercase font-black">
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-[10px] font-black text-primary uppercase tracking-widest mb-2 block">IT Service Management</span>
          <h2 className="text-4xl font-extrabold text-[#1F1F1F]">Support Tickets</h2>
          <p className="text-slate-500 font-medium mt-1">Track and manage your IT assistance requests.</p>
        </div>
        <button className="bg-[#1F1F1F] text-white px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl">
          New Ticket
        </button>
      </header>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white rounded-3xl animate-pulse border-2 border-slate-50" />)}
        </div>
      ) : (
        <div className="grid gap-6">
          {tickets.map((ticket) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key={ticket.id}
              className="bg-white border-2 border-slate-50 rounded-[32px] p-8 shadow-sm hover:shadow-xl transition-all group flex flex-col md:flex-row items-center gap-8"
            >
              <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center flex-shrink-0 ${
                ticket.status === 'resolved' ? 'bg-emerald-50 text-emerald-500' : 'bg-peach text-primary'
              }`}>
                {ticket.status === 'resolved' ? <CheckCircle2 size={32} /> : <Ticket size={32} />}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border-2 ${getStatusStyle(ticket.status)}`}>
                    {ticket.status}
                  </span>
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">#{ticket.id}</span>
                </div>
                <h3 className="text-xl font-black text-[#1F1F1F] truncate group-hover:text-primary transition-colors">{ticket.title}</h3>
                <div className="flex items-center gap-4 mt-3 text-sm font-bold text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <User size={14} />
                    {ticket.assignee}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} />
                    {ticket.date}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <button 
                  onClick={() => handleSlack(ticket.id)}
                  disabled={!!isSlacking || ticket.status === 'resolved'}
                  className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                    ticket.status === 'resolved' 
                    ? 'bg-slate-50 text-slate-300 cursor-not-allowed'
                    : 'bg-[#4A154B] text-white hover:bg-[#350d39] shadow-lg shadow-[#4a154b]/10 active:scale-95'
                  }`}
                >
                  {isSlacking === ticket.id ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : <MessageSquare size={16} />}
                  Slack
                </button>
                <button className="flex-1 md:flex-none p-3 bg-white border-2 border-slate-100 text-slate-400 rounded-2xl hover:border-primary hover:text-primary transition-all">
                  <Send size={20} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
