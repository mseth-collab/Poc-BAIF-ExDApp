/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Paperclip, ChevronRight, LogOut, Smile, Maximize2, X, Mic, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage } from '../types';
import { useEmployee } from './EmployeeContext';

export function BestFrAIendAvatar({ size = 12 }: { size?: number }) {
  const { botAvatar } = useEmployee();
  const outerClass = size === 14 ? 'w-14 h-14 rounded-[20px]' : 'w-12 h-12 rounded-[18px]';
  return (
    <div className={`${outerClass} bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center flex-shrink-0 shadow-md relative overflow-hidden group`}>
      <img 
        src={botAvatar} 
        alt="BestFrAIend Avatar" 
        className="w-full h-full object-cover" 
        referrerPolicy="no-referrer"
      />
      <span className="absolute top-1 right-1 flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
      </span>
    </div>
  );
}

interface ChatInterfaceProps {
  initialQuery?: string;
  onNavigate?: (tab: string, query?: string) => void;
  employeeContext?: any;
}

const DEPARTMENT_SUGGESTIONS: Record<string, Record<string, string[]>> = {
  HR: {
    EN: [
      "How do I request PTO?",
      "What health benefits are available?",
      "Who is our HR Lead?",
      "Where is the employee handbook?"
    ],
    PL: [
      "Jak złożyć wniosek o urlop?",
      "Jakie benefity zdrowotne są dostępne?",
      "Kto jest liderem HR?",
      "Gdzie znajdę podręcznik pracownika?"
    ],
    HR: [
      "Kako mogu zatražiti godišnji?",
      "Koje su zdravstvene pogodnosti dostupne?",
      "Tko je naš voditelj HR-a?",
      "Gdje je priručnik za zaposlenike?"
    ],
    DE: [
      "Wie beantrage ich Urlaub?",
      "Welche Krankenkassenleistungen gibt es?",
      "Wer ist unser HR-Leiter?",
      "Wo finde ich das Mitarbeiterhandbuch?"
    ],
    FR: [
      "Comment demander un congé ?",
      "Quels sont les avantages santé ?",
      "Qui est notre responsable RH ?",
      "Où est le manuel de l'employé ?"
    ]
  },
  IT: {
    EN: [
      "How do I reset my OKTA password?",
      "How do I connect to regional office VPN?",
      "Check IT Compliance standards",
      "How do I contact IT Helpdesk?"
    ],
    PL: [
      "Jak zresetować hasło OKTA?",
      "Jak połączyć się z regionalnym VPN?",
      "Sprawdź standardy zgodności IT",
      "Jak skontaktować się z helpdeskiem IT?"
    ],
    HR: [
      "Kako mogu resetirati OKTA lozinku?",
      "Kako se spojiti na lokalni VPN?",
      "Provjeri IT usklađenost standarda",
      "Kako kontaktirati IT podršku?"
    ],
    DE: [
      "Wie setze ich mein OKTA-Passwort zurück?",
      "Wie verbinde ich mich mit dem VPN?",
      "Überprüfe IT-Compliance-Standards",
      "Wie kontaktiere ich den IT-Helpdesk?"
    ],
    FR: [
      "Comment réinitialiser mon mot de passe OKTA ?",
      "Comment se connecter au VPN régional ?",
      "Vérifier les règles de conformité IT",
      "Comment contacter le support IT ?"
    ]
  },
  Finance: {
    EN: [
      "What are the travel expense limits?",
      "How do I submit Concur expense claims?",
      "Request client entertainment approval",
      "What is our mileage reimbursement rate?"
    ],
    PL: [
      "Jakie są limity wydatków na podróże?",
      "Jak przesłać rozliczenie w Concur?",
      "Wniosek o zatwierdzenie rozrywki klienta",
      "Jaka jest stawka za kilometrówki?"
    ],
    HR: [
      "Koji su limiti za putne troškove?",
      "Kako prijaviti troškove u Concuru?",
      "Zatraži odobrenje za ugošćivanje klijenta",
      "Koja je stopa povrata za kilometražu?"
    ],
    DE: [
      "Was sind die Reisekostenlimits?",
      "Wie reiche ich Spesen über Concur ein?",
      "Genehmigung für Kundenbewirtung beantragen",
      "Wie hoch ist die Kilometerpauschale?"
    ],
    FR: [
      "Quelles sont les limites de frais de déplacement ?",
      "Comment soumettre une note de frais Concur ?",
      "Demander l'approbation de frais de réception",
      "Quel est le taux de remboursement kilométrique ?"
    ]
  }
};

const DEFAULT_SUGGESTIONS: Record<string, string[]> = {
  EN: [
    "Check overall company initiatives",
    "View policy archives library-wide",
    "How do I contact support?",
    "Recent general coordinator updates"
  ],
  PL: [
    "Sprawdź ogólne inicjatywy firmy",
    "Wyświetl całe archiwum zasad",
    "Jak skontaktować się ze wsparciem?",
    "Ostatnie aktualizacje koordynatora"
  ],
  HR: [
    "Provjeri opće inicijative tvrtke",
    "Pregledaj arhivu svih pravila",
    "Kako kontaktirati podršku?",
    "Nedavna ažuriranja koordinatora"
  ],
  DE: [
    "Unternehmensinitiativen ansehen",
    "Durchsuche das Richtlinien-Archiv",
    "Wie erreiche ich den Support?",
    "Letzte Aktualisierungen der Koordinatoren"
  ],
  FR: [
    "Consulter les initiatives de l'entreprise",
    "Parcourir les archives de règles",
    "Comment contacter le support ?",
    "Dernières mises à jour du coordinateur"
  ]
};

export function ChatInterface({ initialQuery, onNavigate, employeeContext }: ChatInterfaceProps) {
  const { region, setRegion, language, employee, t, dept, setDept, regions } = useEmployee();
  
  const langKey = (['EN', 'PL', 'HR', 'DE', 'FR'].includes(language) ? language : 'EN');
  const currentDeptKey = ['HR', 'IT', 'Finance'].includes(dept) ? dept : 'HR';
  const suggestedRepliesList = DEPARTMENT_SUGGESTIONS[currentDeptKey]?.[langKey] || DEFAULT_SUGGESTIONS[langKey] || DEFAULT_SUGGESTIONS.EN;

  const labels = {
    suggestedFor: {
      EN: "Suggested for",
      PL: "Sugerowane dla działu",
      HR: "Predloženo za odjel",
      DE: "Empfohlen für Abteilung",
      FR: "Suggéré pour le département"
    },
    department: {
      EN: "department",
      PL: "",
      HR: "",
      DE: "",
      FR: ""
    },
    switchDept: {
      EN: "Switch Dept:",
      PL: "Zmień dział:",
      HR: "Promijeni odjel:",
      DE: "Abt. wechseln:",
      FR: "Changer de dép :"
    }
  };

  const currentSuggestedForLabel = labels.suggestedFor[langKey as 'EN'] || labels.suggestedFor.EN;
  const currentDeptLabel = labels.department[langKey as 'EN'] !== undefined ? labels.department[langKey as 'EN'] : labels.department.EN;
  const currentSwitchDeptLabel = labels.switchDept[langKey as 'EN'] || labels.switchDept.EN;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeModalMessage, setActiveModalMessage] = useState<ChatMessage | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const initialHandled = useRef(false);

  // Voice Listening System
  const [isListening, setIsListening] = useState(false);
  const [listeningError, setListeningError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const startVoiceListen = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.error("Error stopping recognition:", e);
        }
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setListeningError("Web Speech API not supported. Showing dictation simulation...");
      setIsListening(true);
      const testTimer = setTimeout(() => {
        const samples = [
          "How do I request PTO?",
          "Can you summarize VPN policy?",
          "What is the finance reimbursement rate?",
          "Who is the manager in " + region + " Hub?",
          "Let's check IT security standards."
        ];
        const randomSample = samples[Math.floor(Math.random() * samples.length)];
        setInput(randomSample);
        setIsListening(false);
        setListeningError(null);
      }, 2500);

      recognitionRef.current = {
        stop: () => {
          clearTimeout(testTimer);
          setIsListening(false);
          setListeningError(null);
        }
      };
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = language === 'PL' ? 'pl-PL' : language === 'DE' ? 'de-DE' : language === 'HR' ? 'hr-HR' : 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setListeningError(null);
      };

      recognition.onerror = (e: any) => {
        console.error("Speech Recognition Error:", e);
        if (e.error === 'not-allowed') {
          setListeningError("Microphone access blocked. Please click the mic permissions in address bar.");
        } else if (e.error === 'no-speech') {
          setListeningError("No voice detected. Please try speaking again.");
        } else {
          setListeningError(`Voice engine warning: ${e.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onresult = (e: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = e.resultIndex; i < e.results.length; ++i) {
          if (e.results[i].isFinal) {
            finalTranscript += e.results[i][0].transcript;
          } else {
            interimTranscript += e.results[i][0].transcript;
          }
        }
        
        const currentTranscript = finalTranscript || interimTranscript;
        if (currentTranscript) {
          setInput(currentTranscript);
        }
      };

      recognition.start();
    } catch (err) {
      console.error(err);
      setIsListening(false);
    }
  };

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // clean up safely on unmount
        }
      }
    };
  }, []);

  useEffect(() => {
    if (initialQuery && !initialHandled.current) {
      initialHandled.current = true;
      handleSend(initialQuery);
    }
  }, [initialQuery]);

  const quickAsks = [
    `PTO rules for ${region}`,
    `Regional lead for ${region}`,
    "How much PTO do I have?",
    "Mileage reimbursement rate?"
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (input.length > 3) {
        try {
          const res = await fetch('/api/suggest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ input, region }),
          });
          const data = await res.json();
          setSuggestions(data);
        } catch (err) {
          console.error(err);
        }
      } else {
        setSuggestions([]);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [input, region]);

  const handleSend = async (text: string = input) => {
    if (!text.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setSuggestions([]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [...messages, userMessage],
          region,
          language
        }),
      });

      const data = await response.json();
      const botMessage: ChatMessage = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        role: 'assistant',
        content: '',
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages(prev => [...prev, botMessage]);

      const fullContent = data.content || "I apologize, but I encountered an error. Please try again.";
      let currentContent = '';
      const words = fullContent.split(' ');
      
      for (let i = 0; i < words.length; i++) {
        currentContent += (i === 0 ? '' : ' ') + words[i];
        setMessages(prev => prev.map(m => m.id === botMessage.id ? { ...m, content: currentContent } : m));
        await new Promise(r => setTimeout(r, 15 + Math.random() * 20));
      }
    } catch (error) {
      console.error(error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I'm having trouble retrieving that information right now. Please try again soon.",
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-cream">
      <header className="p-8 border-b-2 border-primary/5 bg-white flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BestFrAIendAvatar size={14} />
          <div>
            <h2 className="text-2xl font-black text-[#1F1F1F] flex items-center gap-2 leading-none">
              BestFrAIend <span className="text-[10px] py-1 px-3 bg-primary/10 text-primary-dark rounded-full font-black uppercase tracking-widest">Assistant</span>
            </h2>
            <p className="text-sm text-slate-500 font-bold mt-1">Geo-aware for region: <span className="text-primary-dark uppercase font-black">{region}</span></p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-4">
          <div className="flex bg-slate-50 border border-slate-100 p-1 rounded-xl">
             {regions.map(r => (
               <button 
                key={r.code}
                onClick={() => {
                   setRegion(r.code);
                }}
                className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${region === r.code ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
               >
                 {r.code}
               </button>
             ))}
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-black uppercase tracking-widest">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Active
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-10 space-y-8" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="max-w-2xl mx-auto py-16 text-center space-y-10">
            <div className="welcome-chat">
              <h3 className="text-4xl font-black text-[#1F1F1F] mb-4">Hello, {employee.name}! 🧡</h3>
              <p className="text-slate-500 text-lg font-medium max-w-lg mx-auto">
                I'm your BestFrAIend at work. I know everything about the employee handbook, travel limits, and more.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
              {quickAsks.map((ask) => (
                <button
                  key={ask}
                  onClick={() => handleSend(ask)}
                  className="p-5 text-left text-sm bg-white border-2 border-slate-100 rounded-[28px] hover:border-primary hover:shadow-xl hover:translate-y-[-2px] transition-all group flex items-center justify-between shadow-sm"
                >
                  <span className="text-[#1F1F1F] group-hover:text-primary font-black uppercase tracking-widest text-xs">{ask}</span>
                  <ChevronRight size={18} strokeWidth={3} className="text-primary-dark/20 group-hover:translate-x-1" />
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key={msg.id}
            className={`flex gap-6 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {msg.role === 'user' ? (
              <div className="w-12 h-12 rounded-[18px] bg-primary text-white flex items-center justify-center flex-shrink-0 shadow-lg">
                <User size={20} strokeWidth={2.5} />
              </div>
            ) : (
              <BestFrAIendAvatar />
            )}
            <div className={`max-w-[75%] p-6 rounded-[32px] overflow-hidden ${
              msg.role === 'user' 
                ? 'bg-[#E1FFC7] text-[#1F1F1F] rounded-tr-none shadow-xl border-b-[3px] border-r-[3px] border-[#c0e0a0]' 
                : 'bg-white text-[#1F1F1F] border-2 border-primary/10 rounded-tl-none shadow-md shadow-primary/5'
            }`}>
              <div className="markdown-body text-md leading-relaxed font-medium">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
              {msg.role === 'assistant' && (
                <div className="flex flex-wrap items-center gap-2.5 mt-4 select-none">
                  <button
                    onClick={() => setActiveModalMessage(msg)}
                    className="text-[9px] font-black uppercase tracking-widest text-[#FF6F3D] hover:bg-[#FF6F3D]/5 hover:text-[#e45c2c] px-3 py-1.5 rounded-xl border border-[#FF6F3D]/20 hover:border-[#FF6F3D]/40 transition-all flex items-center gap-1.5 cursor-pointer"
                    title="Open in full reading pop-up"
                  >
                    <Maximize2 size={10} strokeWidth={2.5} /> Zoom / Pop-Up Reader
                  </button>

                  {/* Moment 3 CTA Button for Time Off/PTO queries */}
                  {(msg.content.toLowerCase().includes('pto') || 
                    msg.content.toLowerCase().includes('urlop') || 
                    msg.content.toLowerCase().includes('vacation') || 
                    msg.content.toLowerCase().includes('time off') || 
                    msg.content.toLowerCase().includes('godišnji')) && (
                    <button
                      onClick={() => {
                        alert("BestFrAIend redirection action completed! Instantly logging you into Workday (Request Time Off cockpit) on another tab via single sign-on.");
                      }}
                      className="text-[9px] font-black uppercase tracking-widest text-white bg-primary hover:bg-pink-600 px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm transition-all animate-pulse"
                    >
                      <span>🌴 Request time off in Workday (SSO)</span>
                    </button>
                  )}
                  
                  {/* Moment 4 CTA Buttons for Travel limits & expense policies */}
                  {(msg.content.toLowerCase().includes('hotel') || 
                    msg.content.toLowerCase().includes('travel limit') || 
                    msg.content.toLowerCase().includes('limit podroży') || 
                    msg.content.toLowerCase().includes('concur') || 
                    msg.content.toLowerCase().includes('dieta') || 
                    msg.content.toLowerCase().includes('biznis putovanj')) && onNavigate && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          onNavigate('knowledge', 'travel limits');
                        }}
                        className="text-[9px] font-black uppercase tracking-widest text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all"
                      >
                        📂 Open Expense Policy in Knowledge
                      </button>
                      <button
                        onClick={() => {
                          onNavigate('tickets', 'Travel limit question clarification');
                        }}
                        className="text-[9px] font-black uppercase tracking-widest text-white bg-emerald-500 hover:bg-emerald-600 px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all"
                      >
                        🎫 Create Ticket if Unclear
                      </button>
                    </div>
                  )}
                </div>
              )}
              <div className={`text-[10px] mt-4 font-black uppercase tracking-widest ${msg.role === 'user' ? 'text-primary/40 text-right' : 'text-slate-300'}`}>
                Sent at {msg.timestamp}
              </div>
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex gap-6">
            <div className="animate-pulse">
              <BestFrAIendAvatar />
            </div>
            <div className="bg-white border-2 border-primary/5 p-6 rounded-[32px] rounded-tl-none shadow-sm flex gap-2 items-center">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
      </div>

      <div className="p-8 bg-white border-t-2 border-primary/5 relative">
        {/* Department Suggested Replies Row */}
        <div className="max-w-4xl mx-auto mb-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3 animate-fade-in">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#1F1F1F] flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              {currentSuggestedForLabel} <span className="text-primary font-black uppercase text-xs">{dept}</span> {currentDeptLabel}
            </span>
            <div className="flex items-center gap-1.5 self-start sm:self-auto">
              <span className="text-[9px] font-bold uppercase tracking-widest text-[#94A3B8]">{currentSwitchDeptLabel}</span>
              <div className="flex bg-slate-100 border border-slate-200/60 p-0.5 rounded-lg shadow-2xs">
                {['HR', 'IT', 'Finance'].map(d => (
                  <button
                    key={d}
                    onClick={() => setDept(d)}
                    className={`px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-md transition-all ${dept === d ? 'bg-primary text-white shadow-xs scale-105' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent snap-x select-none">
            {suggestedRepliesList.map((reply, index) => (
              <button
                key={index}
                onClick={() => handleSend(reply)}
                className="flex-shrink-0 snap-start px-4 py-2.5 bg-cream/30 hover:bg-primary/5 hover:border-primary/40 text-[#1F1F1F] hover:text-primary transition-all rounded-[14px] border border-slate-200 text-xs font-semibold shadow-2xs hover:shadow-xs"
              >
                {reply}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-full left-8 right-8 mb-4 flex flex-wrap gap-2"
            >
              {suggestions.map((s, idx) => (
                <button
                  key={`${s}-${idx}`}
                  onClick={() => handleSend(s)}
                  className="px-4 py-2 bg-white border-2 border-primary/10 rounded-full text-xs font-black uppercase tracking-widest text-[#1F1F1F] hover:border-primary hover:bg-primary/5 transition-all shadow-lg"
                >
                  {s}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="max-w-4xl mx-auto space-y-2">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isListening ? "Listening... Speak your workspace query!" : "Search policies or ask 'BestFrAIend'..."}
              className={`w-full pl-14 pr-44 py-5 bg-cream border-2 rounded-[32px] outline-none transition-all font-bold text-lg ${
                isListening 
                  ? 'border-rose-500 ring-4 ring-rose-500/15 placeholder-rose-600 text-slate-800' 
                  : 'border-primary focus:ring-4 focus:ring-primary/10'
              }`}
            />
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-primary">
              <Sparkles size={24} strokeWidth={2.5} />
            </div>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
               <button
                 type="button"
                 onClick={startVoiceListen}
                 className={`p-2 rounded-full transition-all ${
                   isListening 
                     ? 'bg-rose-500 text-white animate-bounce shadow-md shadow-rose-500/20' 
                     : 'text-primary hover:bg-primary/5 hover:scale-110'
                 }`}
                 title="Talk to BestFrAIend"
               >
                 <Mic size={24} strokeWidth={2.5} />
               </button>
               <button className="p-2 text-primary hover:scale-110 transition-transform hidden sm:block">
                <Paperclip size={24} strokeWidth={2.5} />
               </button>
               <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="px-6 py-3 bg-primary hover:bg-primary-dark disabled:bg-slate-200 text-white rounded-[24px] shadow-xl shadow-primary/20 transition-all font-black uppercase tracking-widest text-xs flex items-center gap-2"
              >
                <Send size={14} strokeWidth={3} />
                <span>Ask Me</span>
              </button>
            </div>
          </div>
          {listeningError && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="text-xs text-rose-500 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 px-4 py-2.5 rounded-xl flex items-center gap-2 font-semibold shadow-2xs"
            >
              <span>⚠️</span>
              <span>{listeningError}</span>
            </motion.div>
          )}
          {isListening && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-between px-5 py-3.5 bg-rose-500/10 dark:bg-rose-500/5 border border-rose-500/20 rounded-2xl text-xs text-rose-500 font-extrabold shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                </span>
                <span className="uppercase tracking-wider">BestFrAIend Voice active — listening to voice queries...</span>
              </div>
              
              {/* Dynamic waveform visualizer bar elements */}
              <div className="flex items-end gap-1 h-5 shrink-0 px-2">
                <span className="w-1 bg-rose-500 rounded-full animate-pulse h-2.5 py-0.5" />
                <span className="w-1 bg-rose-500 rounded-full animate-bounce h-4 py-0.5" style={{ animationDelay: '150ms' }} />
                <span className="w-1 bg-rose-500 rounded-full animate-[pulse_1s_infinite] h-5 py-0.5" style={{ animationDelay: '300ms' }} />
                <span className="w-1 bg-rose-500 rounded-full animate-bounce h-3 py-0.5" style={{ animationDelay: '450ms' }} />
                <span className="w-1 bg-rose-500 rounded-full animate-pulse h-2 py-0.5" />
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* 📖 Deep Reader Pop-Up Modal */}
      <AnimatePresence>
        {activeModalMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#1F1F1F]/60 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6"
            onClick={() => setActiveModalMessage(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              className="bg-white rounded-[40px] shadow-2xl border-2 border-primary/10 max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center">
                    <Bot size={20} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-[#1F1F1F] tracking-tight">BestFrAIend Reader</h4>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#FF6F3D]">
                      Comfortable Full-Sized Reading Mode
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setActiveModalMessage(null)}
                  className="w-10 h-10 rounded-full bg-white hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer shadow-sm hover:scale-105"
                  title="Close Reader"
                >
                  <X size={18} strokeWidth={2.5} />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="p-8 overflow-y-auto space-y-6 flex-1 min-h-0 bg-white">
                <div className="markdown-body prose max-w-none text-slate-800 text-lg leading-relaxed font-normal">
                  <ReactMarkdown>{activeModalMessage.content}</ReactMarkdown>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 text-xs font-bold text-slate-400">
                <div>Sent at: {activeModalMessage.timestamp}</div>
                <button
                  onClick={() => setActiveModalMessage(null)}
                  className="bg-primary hover:bg-pink-600 text-white px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all cursor-pointer hover:scale-105"
                >
                  Close Reader
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
