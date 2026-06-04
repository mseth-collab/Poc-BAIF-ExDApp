/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Search, Mail, MessageSquare, Phone, MapPin, Filter, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useEmployee } from './EmployeeContext';

interface Employee {
  id: string;
  name: string;
  role: string;
  dept: string;
  status: 'online' | 'away' | 'offline';
  email: string;
  region: string;
}

interface DirectoryProps {
  onNavigate?: (tab: string, query?: string) => void;
  employeeContext?: any;
}

export function Directory({ onNavigate, employeeContext }: DirectoryProps = {}) {
  const { region, setRegion, t, language } = useEmployee();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/employees?language=${language}`)
      .then(res => res.json())
      .then(data => {
        setEmployees(data);
        setIsLoading(false);
      });
  }, [language]);

  const regions = {
    PL: '🇵🇱',
    HR: '🇭🇷',
    US: '🇺🇸',
    DE: '🇩🇪',
    CA: '🇨🇦',
    Other: '🌍'
  };

  const filteredEmployees = employees.filter(e => {
    const searchMatch = e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        e.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        e.dept.toLowerCase().includes(searchTerm.toLowerCase());
    return searchMatch;
  }).sort((a, b) => {
    // Show people from current region first
    if (a.region === region && b.region !== region) return -1;
    if (a.region !== region && b.region === region) return 1;
    return 0;
  });

  return (
    <div className="p-10 max-w-6xl mx-auto space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-[10px] font-black text-primary uppercase tracking-widest mb-2 block">Internal Directory</span>
          <h2 className="text-4xl font-extrabold text-[#1F1F1F]">People Hub</h2>
          <p className="text-slate-500 font-medium mt-1">Connect with your teammates across the organization.</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, role, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-primary outline-none transition-all font-medium text-sm shadow-sm"
          />
        </div>
      </header>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-48 bg-white rounded-[32px] animate-pulse border-2 border-slate-50" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map((person) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              key={person.id}
              className="bg-white border-2 border-slate-50 rounded-[32px] p-8 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4">
                 <div className={`w-3 h-3 rounded-full border-2 border-white ${
                   person.status === 'online' ? 'bg-emerald-500' : 
                   person.status === 'away' ? 'bg-amber-500' : 'bg-slate-300'
                 }`} />
              </div>

              <div className="flex items-start gap-5 mb-6">
                <div className="w-16 h-16 bg-peach rounded-2xl flex items-center justify-center text-primary text-2xl font-black shadow-inner">
                  {person.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#1F1F1F] group-hover:text-primary transition-colors flex items-center gap-2">
                    {person.name}
                    <span className="text-sm opacity-60 ml-1" title={person.region}>
                      {regions[person.region as keyof typeof regions] || person.region}
                    </span>
                    {person.id === 'e1' && <span className="text-[9px] bg-primary text-white px-2 py-0.5 rounded-full uppercase">You</span>}
                  </h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">{person.role}</p>
                  <p className="text-[10px] font-black text-primary mt-1 uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded-md w-fit">
                    {person.dept}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-50 hover:bg-primary hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                  <Mail size={14} /> Email
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-50 hover:bg-[#4A154B] hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                  <MessageSquare size={14} /> Slack
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
