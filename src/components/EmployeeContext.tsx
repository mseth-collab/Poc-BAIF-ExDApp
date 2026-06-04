/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { TRANSLATIONS, TranslationDictionary, LanguageCode } from '../lib/translations';

export interface Employee {
  name: string;
  role: string;
  email: string;
  region: string;
  dept: string;
}

export interface Persona {
  id: string;
  name: string;
  country: string;
  role: string;
  email: string;
  demoQuestion: string;
  flag: string;
  location: string;
}

export const DEFAULT_PERSONA_ID = 'anna';

export const DEMO_PERSONAS: Persona[] = [
  {
    id: 'anna',
    name: 'Anna Kowalska',
    country: 'PL',
    role: 'Platform Engineer',
    email: 'anna.kowalska@exadel.com',
    demoQuestion: 'What is my PTO balance and how do I file PL PIT-11 tax?',
    flag: '🇵🇱',
    location: 'Warsaw',
  },
  {
    id: 'oleksandr',
    name: 'Oleksandr Klymenko',
    country: 'UA',
    role: 'Software Engineer',
    email: 'o.klymenko@exadel.com',
    demoQuestion: 'What are the local holidays in Ukraine and who is my HR contact?',
    flag: '🇺🇦',
    location: 'Kyiv',
  },
  {
    id: 'jane',
    name: 'Jane Doe',
    country: 'US',
    role: 'Senior Analyst',
    email: 'j.doe@exadel.com',
    demoQuestion: 'How do I update W-4 withholdings and select health benefits open enrollment?',
    flag: '🇺🇸',
    location: 'Austin, TX',
  },
  {
    id: 'sophie',
    name: 'Sophie Laurent',
    country: 'CA',
    role: 'Solutions Architect',
    email: 's.laurent@exadel.com',
    demoQuestion: 'Where can I log my Canadian T4 tax documents and access RRSP info?',
    flag: '🇨🇦',
    location: 'Toronto, ON',
  },
];

export interface RegionDetail {
  code: string;
  name: string;
  flag: string;
  hrLead: string;
  hrEmail: string;
  itContact: string;
  officeAddress?: string;
}

export interface BotAvatarOption {
  id: string;
  name: string;
  url: string;
  description: string;
}

export const BOT_AVATARS: BotAvatarOption[] = [
  {
    id: 'friendly',
    name: 'Friendly Assistant',
    url: '/src/assets/images/bot_friendly_1780519621026.png',
    description: 'Sleek 3D humanoid robot with warm smiling eyes',
  },
  {
    id: 'professional',
    name: 'Professional Core',
    url: '/src/assets/images/bot_professional_1780519634593.png',
    description: 'Tech-forward metallic spherical core with digital highlights',
  },
  {
    id: 'creative',
    name: 'Creative Chibi',
    url: '/src/assets/images/bot_creative_1780519646412.png',
    description: 'Cute 3D assistant with lemon yellow ears and pink headphones',
  },
];

export interface EmployeeContextType {
  employee: Employee;
  region: string;
  setRegion: (region: string) => void;
  language: string;
  setLanguage: (lang: string) => void;
  dept: string;
  setDept: (dept: string) => void;
  theme: string;
  setTheme: (theme: string) => void;
  botAvatar: string;
  setBotAvatar: (avatar: string) => void;
  interfaceMode: 'web' | 'mobile';
  setInterfaceMode: (mode: 'web' | 'mobile') => void;
  regions: RegionDetail[];
  currentRegionDetail: RegionDetail;
  t: (key: keyof TranslationDictionary) => string;
  translations: TranslationDictionary;
  activePersonaId: string;
  setActivePersonaId: (id: string) => void;
  personas: Persona[];
  activePersona: Persona;
}

const REGIONS: RegionDetail[] = [
  { code: 'PL', name: 'Poland', flag: '🇵🇱', hrLead: 'Anna Kowalska', hrEmail: 'hr.pl@exadel.com', itContact: 'it.pl@exadel.com', officeAddress: 'Warsaw Spire, Pl. Europejski 1' },
  { code: 'UA', name: 'Ukraine', flag: '🇺🇦', hrLead: 'Oleksandr Klymenko', hrEmail: 'hr.ua@exadel.com', itContact: 'it.ua@exadel.com', officeAddress: 'Kyiv Hotdesk Facility' },
  { code: 'US', name: 'USA', flag: '🇺🇸', hrLead: 'Mark Thompson', hrEmail: 'hr.us@exadel.com', itContact: 'it.us@exadel.com', officeAddress: 'California Remote Hub' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', hrLead: 'Mark Thompson', hrEmail: 'hr.ca@exadel.com', itContact: 'it.ca@exadel.com', officeAddress: 'Toronto Flex Desk' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', hrLead: 'Elena Wagner', hrEmail: 'hr.de@exadel.com', itContact: 'it.de@exadel.com', officeAddress: 'Berlin Co-Working Hub' },
  { code: 'HR', name: 'Croatia', flag: '🇭🇷', hrLead: 'Marko Horvat', hrEmail: 'hr.hr@exadel.com', itContact: 'it.hr@exadel.com', officeAddress: 'Matrix Build. Zagreb' },
  { code: 'FR', name: 'France', flag: '🇫🇷', hrLead: 'Marie Dubois', hrEmail: 'hr.fr@exadel.com', itContact: 'it.fr@exadel.com', officeAddress: 'Paris Delivery Center, Rue de Rivoli' },
  { code: 'GE', name: 'Georgia', flag: '🇬🇪', hrLead: 'Nina Bakradze', hrEmail: 'hr.ge@exadel.com', itContact: 'it.ge@exadel.com', officeAddress: 'Tbilisi Tech Office, Chavchavadze Ave' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', hrLead: 'Lucas Silva', hrEmail: 'hr.br@exadel.com', itContact: 'it.br@exadel.com', officeAddress: 'São Paulo Office, Av. Paulista' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱', hrLead: 'Sofía Gomez', hrEmail: 'hr.cl@exadel.com', itContact: 'it.cl@exadel.com', officeAddress: 'Santiago Innovation Hub' },
  { code: 'BY', name: 'Belarus', flag: '🇧🇾', hrLead: 'Yury Petrov', hrEmail: 'hr.by@exadel.com', itContact: 'it.by@exadel.com', officeAddress: 'Minsk Dev Hub, Praspyekt Nyezalyezhnastsi' },
];

function resolvePersonaId(stored: string | null): string {
  if (stored && DEMO_PERSONAS.some((p) => p.id === stored)) return stored;
  return DEFAULT_PERSONA_ID;
}

const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined);

export function EmployeeProvider({ children }: { children: React.ReactNode }) {
  const [activePersonaId, setActivePersonaIdState] = useState(() =>
    resolvePersonaId(localStorage.getItem('demo-persona-id')),
  );

  const activePersona =
    DEMO_PERSONAS.find((p) => p.id === activePersonaId) || DEMO_PERSONAS[0];

  const [region, setRegionState] = useState(() => {
    const storedPersona = resolvePersonaId(localStorage.getItem('demo-persona-id'));
    const persona = DEMO_PERSONAS.find((p) => p.id === storedPersona);
    const storedRegion = localStorage.getItem('user-region');
    if (storedRegion && REGIONS.some((r) => r.code === storedRegion)) return storedRegion;
    return persona?.country || activePersona.country;
  });

  const [language, setLanguageState] = useState(() => localStorage.getItem('user-lang') || 'EN');
  const [dept, setDeptState] = useState(() => localStorage.getItem('user-dept') || 'Engineering');
  const [theme, setThemeState] = useState('light');
  const [botAvatar, setBotAvatarState] = useState(
    () => localStorage.getItem('bot-avatar') || '/src/assets/images/bot_friendly_1780519621026.png',
  );
  const [interfaceMode, setInterfaceModeState] = useState<'web' | 'mobile'>(() => {
    return (localStorage.getItem('interface-mode') as 'web' | 'mobile') || 'web';
  });

  const setActivePersonaId = (id: string) => {
    const persona = DEMO_PERSONAS.find((p) => p.id === id);
    if (!persona) return;
    setActivePersonaIdState(id);
    localStorage.setItem('demo-persona-id', id);
    setRegionState(persona.country);
    localStorage.setItem('user-region', persona.country);
    window.dispatchEvent(new Event('storage'));
  };

  const setRegion = (r: string) => {
    setRegionState(r);
    localStorage.setItem('user-region', r);
    const persona = DEMO_PERSONAS.find((p) => p.country === r);
    if (persona && persona.id !== activePersonaId) {
      setActivePersonaIdState(persona.id);
      localStorage.setItem('demo-persona-id', persona.id);
    }
    window.dispatchEvent(new Event('storage'));
  };

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    localStorage.setItem('user-lang', lang);
  };

  const setDept = (d: string) => {
    setDeptState(d);
    localStorage.setItem('user-dept', d);
    window.dispatchEvent(new Event('storage'));
  };

  const setTheme = (_t: string) => {
    setThemeState('light');
    localStorage.setItem('user-theme', 'light');
    document.documentElement.classList.remove('dark');
  };

  const setBotAvatar = (avatar: string) => {
    setBotAvatarState(avatar);
    localStorage.setItem('bot-avatar', avatar);
  };

  const setInterfaceMode = (mode: 'web' | 'mobile') => {
    setInterfaceModeState(mode);
    localStorage.setItem('interface-mode', mode);
  };

  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  useEffect(() => {
    const persona = DEMO_PERSONAS.find((p) => p.id === activePersonaId);
    if (persona && persona.country !== region) {
      setRegionState(persona.country);
      localStorage.setItem('user-region', persona.country);
    }
  }, [activePersonaId]);

  useEffect(() => {
    const handleStorage = () => {
      const storedPersona = localStorage.getItem('demo-persona-id');
      if (storedPersona) {
        const resolved = resolvePersonaId(storedPersona);
        if (resolved !== activePersonaId) setActivePersonaIdState(resolved);
      }
      const stored = localStorage.getItem('user-region');
      if (stored && stored !== region && REGIONS.some((r) => r.code === stored)) {
        setRegionState(stored);
      }
      const storedDept = localStorage.getItem('user-dept');
      if (storedDept && storedDept !== dept) setDeptState(storedDept);
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [region, dept, activePersonaId]);

  const employee: Employee = {
    name: activePersona.name,
    role: activePersona.role,
    email: activePersona.email,
    region,
    dept,
  };

  const currentRegionDetail =
    REGIONS.find((r) => r.code === region) ||
    REGIONS.find((r) => r.code === activePersona.country) ||
    REGIONS[0];

  const activeLang = (TRANSLATIONS[language as LanguageCode] ? language : 'EN') as LanguageCode;
  const translations = TRANSLATIONS[activeLang];

  const t = (key: keyof TranslationDictionary) => {
    return translations[key] || TRANSLATIONS.EN[key] || '';
  };

  const value: EmployeeContextType = {
    employee,
    region,
    setRegion,
    language,
    setLanguage,
    dept,
    setDept,
    theme: 'light',
    setTheme,
    botAvatar,
    setBotAvatar,
    interfaceMode,
    setInterfaceMode,
    regions: REGIONS,
    currentRegionDetail,
    t,
    translations,
    activePersonaId,
    setActivePersonaId,
    personas: DEMO_PERSONAS,
    activePersona,
  };

  return <EmployeeContext.Provider value={value}>{children}</EmployeeContext.Provider>;
}

export function useEmployee() {
  const context = useContext(EmployeeContext);
  if (!context) {
    throw new Error('useEmployee must be used within an EmployeeProvider');
  }
  return context;
}