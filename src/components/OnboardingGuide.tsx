/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { CheckCircle2, Circle, Clock, Rocket, ShieldCheck, Laptop, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { useEmployee } from './EmployeeContext';

interface Task {
  id: string;
  title: string;
  desc: string;
  icon: any;
  status: 'done' | 'todo' | 'waiting';
}

export function OnboardingGuide({ region }: { region: string }) {
  const { t } = useEmployee();
  const tasks: Task[] = [
    { id: '1', title: 'Claim Credentials', desc: 'Secure your OKTA and email access.', icon: ShieldCheck, status: 'done' },
    { id: '2', title: 'Equipment Setup', desc: `Pick up your kit at the ${region} hub.`, icon: Laptop, status: 'todo' },
    { id: '3', title: 'Join Slack', desc: 'Connect to #new-joiners and #regional-hq.', icon: MessageCircle, status: 'todo' },
    { id: '4', title: 'Policy Review', desc: 'Read the regional PTO addendum.', icon: Rocket, status: 'waiting' },
  ];

  const progress = (tasks.filter(t => t.status === 'done').length / tasks.length) * 100;

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-md font-extrabold text-[#1F1F1F] flex items-center gap-2">
            <Rocket className="text-primary" size={18} />
            {t('newJoinerGuide')}
          </h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{region} {t('checklistSubtitle')}</p>
        </div>
        <div className="text-right">
          <div className="text-lg font-black text-primary">{Math.round(progress)}%</div>
          <div className="text-[8px] font-black uppercase text-slate-400 tracking-widest leading-none">{t('completePercent')}</div>
        </div>
      </div>

      <div className="w-full h-1.5 bg-slate-50 rounded-full mb-6 overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-full bg-primary"
        />
      </div>

      <div className="space-y-2">
        {tasks.map((task, idx) => (
          <motion.div 
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            key={task.id}
            className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
              task.status === 'done' ? 'bg-emerald-50/50 border-emerald-100/60' : 'bg-slate-50 border-transparent hover:border-slate-200'
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              task.status === 'done' ? 'bg-emerald-500 text-white' : 'bg-white text-slate-400 shadow-sm'
            }`}>
              <task.icon size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className={`text-xs font-bold leading-snug truncate ${task.status === 'done' ? 'text-emerald-900 line-through opacity-60' : 'text-[#1F1F1F]'}`}>
                {task.title}
              </h4>
              <p className="text-[10px] text-slate-400 overflow-hidden text-ellipsis whitespace-nowrap">{task.desc}</p>
            </div>
            {task.status === 'done' ? (
              <CheckCircle2 size={14} className="text-emerald-500" />
            ) : task.status === 'todo' ? (
              <Circle size={14} className="text-primary" />
            ) : (
              <Clock size={14} className="text-slate-300" />
            )}
          </motion.div>
        ))}
      </div>

      <button className="w-full mt-4 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all">
        {t('openPortal')}
      </button>
    </div>
  );
}
