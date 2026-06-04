/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEmployee, BOT_AVATARS } from './EmployeeContext';
import { Menu, Globe, Phone, Mail, MapPin, X, Users, Sun, Moon, Sparkles, Laptop, Smartphone } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderBarProps {
  onToggleSidebar: () => void;
}

export function HeaderBar({ onToggleSidebar }: HeaderBarProps) {
  const { 
    region, 
    setRegion, 
    regions, 
    currentRegionDetail, 
    language, 
    setLanguage, 
    t, 
    theme, 
    setTheme,
    interfaceMode,
    setInterfaceMode,
    botAvatar,
    setBotAvatar
  } = useEmployee();
  
  const [isHrModalOpen, setIsHrModalOpen] = useState(false);
  const [isRegionDropdownOpen, setIsRegionDropdownOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isStudioDropdownOpen, setIsStudioDropdownOpen] = useState(false);

  const handleRegionSelect = (code: string) => {
    setRegion(code);
    setIsRegionDropdownOpen(false);
  };

  const handleLangSelect = (lang: string) => {
    setLanguage(lang);
    setIsLangDropdownOpen(false);
  };

  return (
    <>
      <header className="h-16 border-b border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 px-6 flex items-center justify-between z-30 sticky top-0 transition-colors duration-200">
        {/* Left: Mobile Menu Toggle & Brand Marker */}
        <div className="flex items-center gap-3">
          <button 
            onClick={onToggleSidebar}
            className="p-2 -ml-1 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg lg:hidden"
            aria-label="Toggle menu"
          >
            <Menu size={20} strokeWidth={2.5} />
          </button>
          
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {t('portalContext')}
            </span>
            <span className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/60 px-2.5 py-0.5 rounded-md">
              {t('secureHub')}
            </span>
          </div>
        </div>

        {/* Right: Country / Language / Contact HR */}
        <div className="flex items-center gap-3">
          {/* Region Button */}
          <div className="relative">
            <button
              onClick={() => {
                setIsRegionDropdownOpen(!isRegionDropdownOpen);
                setIsLangDropdownOpen(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 transition-all active:scale-95"
            >
              <span className="text-sm leading-none">{currentRegionDetail.flag}</span>
              <span className="hidden md:inline uppercase">{region}</span>
            </button>
            
            <AnimatePresence>
              {isRegionDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsRegionDropdownOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute right-0 mt-1 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 p-1.5 space-y-0.5"
                  >
                    <div className="px-2.5 py-1 text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                      {t('switchHub')}
                    </div>
                    {regions.map((reg) => (
                      <button
                        key={reg.code}
                        onClick={() => handleRegionSelect(reg.code)}
                        className={`w-full flex items-center justify-between text-left px-2.5 py-2 rounded-lg text-xs font-semibold ${
                          region === reg.code ? 'bg-primary/5 dark:bg-primary/10 text-primary font-bold' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>{reg.flag}</span>
                          <span>{reg.name} &mdash; {reg.code}</span>
                        </span>
                        {region === reg.code && (
                          <span className="text-[9px] font-black uppercase tracking-wide text-primary">
                            {t('active')}
                          </span>
                        )}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Lang Selector */}
          <div className="relative">
            <button
              onClick={() => {
                setIsLangDropdownOpen(!isLangDropdownOpen);
                setIsRegionDropdownOpen(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 transition-all active:scale-95"
              title="Change Language"
            >
              <Globe size={13} className="text-slate-400 dark:text-slate-500" />
              <span>{language}</span>
            </button>

            <AnimatePresence>
              {isLangDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsLangDropdownOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-xl z-50 p-2 space-y-0.5"
                  >
                    <div className="px-2.5 py-1 text-[11px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                      Language menu
                    </div>
                    {[
                      { code: 'EN', name: 'English' },
                      { code: 'PL', name: 'Polish' },
                      { code: 'HR', name: 'Croatian' },
                      { code: 'DE', name: 'German' },
                      { code: 'FR', name: 'French' },
                    ].map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleLangSelect(lang.code)}
                        className={`w-full flex items-center justify-between text-left px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          language === lang.code ? 'bg-primary/5 dark:bg-primary/10 text-primary font-black' : 'hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span>{lang.name}</span>
                        {language === lang.code && (
                          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        )}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* BestFrAIend Studio custom personalization menu */}
          <div className="relative">
            <button
              onClick={() => {
                setIsStudioDropdownOpen(!isStudioDropdownOpen);
                setIsRegionDropdownOpen(false);
                setIsLangDropdownOpen(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-black text-primary transition-all active:scale-95"
              title="Personalize BestFrAIend"
            >
              <Sparkles size={13} className="text-primary animate-pulse" />
              <span className="hidden md:inline">Studio</span>
            </button>

            <AnimatePresence>
              {isStudioDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsStudioDropdownOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-xl z-50 p-3 space-y-3"
                  >
                    <div>
                      <h4 className="text-[11px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                        Rendering Options
                      </h4>
                      <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                        <button
                          onClick={() => {
                            setInterfaceMode('web');
                            setIsStudioDropdownOpen(false);
                          }}
                          className={`py-2 rounded-lg border text-[10px] font-black flex flex-col items-center gap-1 transition-all ${
                            interfaceMode === 'web'
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          <Laptop size={12} />
                          <span>💻 Web Layout</span>
                        </button>
                        <button
                          onClick={() => {
                            setInterfaceMode('mobile');
                            setIsStudioDropdownOpen(false);
                          }}
                          className={`py-2 rounded-lg border text-[10px] font-black flex flex-col items-center gap-1 transition-all ${
                            interfaceMode === 'mobile'
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          <Smartphone size={12} />
                          <span>📱 Mobile App</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-[11px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                        Set Chatbot Face
                      </h4>
                      <div className="space-y-1.5 mt-1.5">
                        {BOT_AVATARS.map((avatar) => (
                          <button
                            key={avatar.id}
                            onClick={() => {
                              setBotAvatar(avatar.url);
                            }}
                            className={`w-full p-1.5 rounded-lg border text-left flex items-center gap-2 transition-all ${
                              botAvatar === avatar.url
                                ? 'border-primary bg-primary/5 font-black text-slate-850 dark:text-slate-100'
                                : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            <img
                              src={avatar.url}
                              alt={avatar.name}
                              className="w-7 h-7 rounded-md object-cover bg-slate-50 shrink-0"
                              referrerPolicy="no-referrer"
                            />
                            <div className="min-w-0">
                              <p className="text-[10px] font-bold leading-tight truncate">{avatar.name}</p>
                              <p className="text-[8px] text-slate-450 dark:text-slate-500 truncate leading-tight mt-0.5">{avatar.description}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[9px] text-slate-400 dark:text-slate-500 font-extrabold uppercase">
                      <span>Corporate Premium</span>
                      <span className="w-2 h-2 rounded-full bg-[#FF5D8F]" />
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Theme Toggle Option */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex items-center justify-center p-2 bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 hover:bg-slate-100 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-amber-400 transition-all active:scale-95"
            title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === 'dark' ? (
              <Sun size={14} strokeWidth={2.5} className="text-amber-500" />
            ) : (
              <Moon size={14} strokeWidth={2.5} className="text-indigo-600" />
            )}
          </button>

          {/* Contact Region HR Action Button */}
          <button
            onClick={() => setIsHrModalOpen(true)}
            className="px-3.5 py-1.5 bg-slate-900 border border-slate-800 text-white rounded-lg text-xs font-extrabold shadow-sm hover:bg-slate-800 hover:scale-[1.02] transition-all active:scale-[0.98]"
          >
            {t('contactHr')} ({region === 'Other' ? 'Global' : region})
          </button>
        </div>
      </header>

      {/* HR Lead Info Modal */}
      <AnimatePresence>
        {isHrModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsHrModalOpen(false)}
              className="fixed inset-0 bg-slate-900 z-[100]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 z-[101]"
            >
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xl leading-none">{currentRegionDetail.flag}</span>
                  <h3 className="text-lg font-black text-slate-900 uppercase">
                    {region} {t('workplaceHelpdesks')}
                  </h3>
                </div>
                <button
                  onClick={() => setIsHrModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-primary tracking-widest mb-2.5">
                    <Users size={12} />
                    {t('regionalHrPartner')}
                  </div>
                  <h4 className="text-md font-extrabold text-[#1F1F1F] mb-1.5">
                    {currentRegionDetail.hrLead}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <Mail size={13} className="text-slate-400" />
                    <a href={`mailto:${currentRegionDetail.hrEmail}`} className="hover:underline transition-all hover:text-primary font-semibold">
                      {currentRegionDetail.hrEmail}
                    </a>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-primary tracking-widest mb-2.5">
                    <Phone size={12} />
                    {t('itHelpdesk')}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <Mail size={13} className="text-slate-400" />
                    <a href={`mailto:${currentRegionDetail.itContact}`} className="hover:underline transition-all hover:text-primary font-semibold">
                      {currentRegionDetail.itContact}
                    </a>
                  </div>
                </div>

                {currentRegionDetail.officeAddress && (
                  <div className="p-4 bg-slate-50/70 border border-slate-100/80 rounded-xl">
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">
                      <MapPin size={12} />
                      {t('officeAddress')}
                    </div>
                    <p className="text-xs font-bold text-slate-600 leading-tight">
                      {currentRegionDetail.officeAddress}
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={() => setIsHrModalOpen(false)}
                className="w-full mt-6 py-2.5 bg-slate-900 text-white rounded-lg text-xs font-extrabold uppercase tracking-wide hover:bg-slate-800 transition-all shadow-sm"
              >
                {t('closeBtn')}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
