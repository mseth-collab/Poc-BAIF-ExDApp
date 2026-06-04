/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TranslationDictionary {
  // Sidebar/Navigation
  dashboard: string;
  chat: string;
  policyLibrary: string;
  aiHub: string;
  orgFeed: string;
  directory: string;
  contactHr: string;
  dynamicHelp: string;
  contextLoaded: string;

  // Header / Common
  portalContext: string;
  secureHub: string;
  switchHub: string;
  workplaceHelpdesks: string;
  regionalHrPartner: string;
  itHelpdesk: string;
  officeAddress: string;
  closeBtn: string;
  active: string;

  // Dashboard
  consoleTitle: string;
  consoleDesc: string;
  searchPlaceholder: string;
  askBtn: string;
  newsBrief: string;
  meetingsBrief: string;
  nextSync: string;
  openPlanner: string;
  quickActions: string;
  exploreDirectories: string;
  corporateArchives: string;
  usersActive: string;
  openTickets: string;

  // Quick action buttons
  requestPto: string;
  reportIssue: string;
  fileExpense: string;
  bookDesk: string;
  ptoBalance: string;
  itFacilitySupport: string;
  sapConcur: string;
  officeHubSeats: string;

  // New Joiner Guide
  newJoinerGuide: string;
  checklistSubtitle: string;
  completePercent: string;
  openPortal: string;

  // Command Palette
  cmdKSearch: string;
  cmdKPlaceholder: string;
  bestFriendSolution: string;
  continueConversation: string;
  helpFaqs: string;
  onboardingTab: string;
}

export type LanguageCode = 'EN' | 'PL' | 'HR' | 'DE' | 'FR';

export const TRANSLATIONS: Record<LanguageCode, TranslationDictionary> = {
  EN: {
    dashboard: "Dashboard",
    chat: "BestFrAIend Chat",
    policyLibrary: "Policy Library",
    aiHub: "AI Innovation Hub",
    orgFeed: "Org Feed",
    directory: "Directory",
    contactHr: "Contact HR",
    dynamicHelp: "Dynamic Help",
    contextLoaded: "Context Loaded",
    portalContext: "Portal Context",
    secureHub: "Secure Intranet Hub",
    switchHub: "Switch Workplace Hub",
    workplaceHelpdesks: "Workplace Helpdesks",
    regionalHrPartner: "Regional HR Business Partner",
    itHelpdesk: "IT Provisioning Helpdesk",
    officeAddress: "Regional Office Address",
    closeBtn: "Close Directory Coordinates",
    active: "Active",
    consoleTitle: "BestFrAIend Search Console",
    consoleDesc: "Access internal policies, IT compliance wiki, FAQs, and instant answers in real time.",
    searchPlaceholder: "Ask standard rules, e.g., 'How do I connect to regional VPN?'",
    askBtn: "Ask Console",
    newsBrief: "Org News Brief",
    meetingsBrief: "Weekly Meetings Brief",
    nextSync: "Next Sync",
    openPlanner: "Open Day Planner",
    quickActions: "Quick Actions",
    exploreDirectories: "Explore Policy Directories",
    corporateArchives: "Corporate Archives",
    usersActive: "Users Active",
    openTickets: "Open Tickets",
    requestPto: "Request PTO",
    reportIssue: "Report Issue",
    fileExpense: "File Expense",
    bookDesk: "Book Desk",
    ptoBalance: "Balance: 24 days",
    itFacilitySupport: "IT / Facility Support",
    sapConcur: "SAP Concur Sign-in",
    officeHubSeats: "Office Hub Seats",
    newJoinerGuide: "New Joiner Guide",
    checklistSubtitle: "Checklist",
    completePercent: "Complete",
    openPortal: "Open Onboarding Portal",
    cmdKSearch: "Cmd + K to Search",
    cmdKPlaceholder: "Search navigation or type question...",
    bestFriendSolution: "BestFrAIend Solution",
    continueConversation: "Continue conversation",
    helpFaqs: "Help FAQs",
    onboardingTab: "Onboarding",
  },
  PL: {
    dashboard: "Pulpit",
    chat: "Czat BestFrAIend",
    policyLibrary: "Biblioteka Zasad",
    aiHub: "Centrum Innowacji AI",
    orgFeed: "Wiadomości Firmowe",
    directory: "Katalog Pracowników",
    contactHr: "Skontaktuj się z HR",
    dynamicHelp: "Pomoc Dynamiczna",
    contextLoaded: "Załadowano Kontekst",
    portalContext: "Kontekst Portalu",
    secureHub: "Bezpieczny Intranet",
    switchHub: "Przełącz Centrum Pracy",
    workplaceHelpdesks: "Wsparcie w Miejscu Pracy",
    regionalHrPartner: "Regionalny Partner HR",
    itHelpdesk: "Pomoc IT i Aprowizacja",
    officeAddress: "Adres Biura Regionalnego",
    closeBtn: "Zamknij Koordynaty",
    active: "Aktywny",
    consoleTitle: "Konsola Wyszukiwania BestFrAIend",
    consoleDesc: "Uzyskaj dostęp do wewnętrznych polityk, zasad IT, FAQ i natychmiastowych odpowiedzi.",
    searchPlaceholder: "Zadaj pytanie, np. 'Jak połączyć się z regionalnym VPN?'",
    askBtn: "Zapytaj Konsolę",
    newsBrief: "Skrót Wiadomości",
    meetingsBrief: "Skrót Spotkań Tygodniowych",
    nextSync: "Następny Sync",
    openPlanner: "Planer Dnia",
    quickActions: "Szybkie Działania",
    exploreDirectories: "Przeglądaj Katalogi Zasad",
    corporateArchives: "Archiwa Korporacyjne",
    usersActive: "Aktywni Użytkownicy",
    openTickets: "Otwarte Zgłoszenia",
    requestPto: "Wniosek o Urlop",
    reportIssue: "Zgłoś Problem",
    fileExpense: "Rozlicz Wydatek",
    bookDesk: "Zarezerwuj Biurko",
    ptoBalance: "Pozostało: 24 dni",
    itFacilitySupport: "Wsparcie IT / Biurowe",
    sapConcur: "Logowanie SAP Concur",
    officeHubSeats: "Miejsca w Biurze",
    newJoinerGuide: "Przewodnik Nowego Pracownika",
    checklistSubtitle: "Lista kontrolna",
    completePercent: "Ukończono",
    openPortal: "Otwórz Portal Onboardingowy",
    cmdKSearch: "Naciśnij Cmd + K aby szukać",
    cmdKPlaceholder: "Przeszukaj menu lub zadaj pytanie...",
    bestFriendSolution: "Rozwiązanie BestFrAIend",
    continueConversation: "Kontynuuj konwersację",
    helpFaqs: "Pomoc i FAQ",
    onboardingTab: "Wprowadzenie",
  },
  HR: {
    dashboard: "Nadzorna Ploča",
    chat: "BestFrAIend Razgovor",
    policyLibrary: "Knjižnica Pravila",
    aiHub: "Centar za AI Inovacije",
    orgFeed: "Vijesti i Objave",
    directory: "Imenik Zaposlenika",
    contactHr: "Kontaktiraj HR",
    dynamicHelp: "Dinamička Pomoć",
    contextLoaded: "Kontekst Učitan",
    portalContext: "Kontekst Portala",
    secureHub: "Siguran Intranet Portal",
    switchHub: "Promijeni Regionalni Ured",
    workplaceHelpdesks: "Uredska Podrška",
    regionalHrPartner: "Regionalni HR Partner",
    itHelpdesk: "IT Podrška i Oprema",
    officeAddress: "Adresa Regionalnog Ureda",
    closeBtn: "Zatvori detalje",
    active: "Aktivno",
    consoleTitle: "BestFrAIend Konzola za Pretraživanje",
    consoleDesc: "Omogućuje brz pristup internim pravilnicima, IT vodičima, odgovorima i podršci.",
    searchPlaceholder: "Postavite pitanje, npr. 'Kako se spojiti na VPN?'",
    askBtn: "Pitaj Konzolu",
    newsBrief: "Sažetak Vijesti",
    meetingsBrief: "Pregled Tjednih Sastanaka",
    nextSync: "Sljedeći usklađivanje",
    openPlanner: "Planer Dana",
    quickActions: "Brze Akcije",
    exploreDirectories: "Pretraži Pravilnike",
    corporateArchives: "Korporativni Arhiv",
    usersActive: "Aktivni Korisnici",
    openTickets: "Otvoreni Tiketi",
    requestPto: "Zahtjev za Godišnji",
    reportIssue: "Prijavi Problem",
    fileExpense: "Prijavi Trošak",
    bookDesk: "Rezerviraj Stol",
    ptoBalance: "Preostalo: 24 dana",
    itFacilitySupport: "Podrška za IT / Ured",
    sapConcur: "Prijava na SAP Concur",
    officeHubSeats: "Rezervacija Mjesta",
    newJoinerGuide: "Vodič za Nove Zaposlenike",
    checklistSubtitle: "Popis zadataka",
    completePercent: "Završeno",
    openPortal: "Otvori Onboarding Portal",
    cmdKSearch: "Cmd + K za pretraživanje",
    cmdKPlaceholder: "Pretraži navigaciju ili upiši pitanje...",
    bestFriendSolution: "BestFrAIend Rješenje",
    continueConversation: "Nastavi razgovor",
    helpFaqs: "Česta Pitanja",
    onboardingTab: "Uvođenje u rad",
  },
  DE: {
    dashboard: "Dashboard",
    chat: "BestFrAIend Chat",
    policyLibrary: "Richtlinien-Bibliothek",
    aiHub: "AI Innovations-Hub",
    orgFeed: "Unternehmens-Feed",
    directory: "Mitarbeiterverzeichnis",
    contactHr: "HR kontaktieren",
    dynamicHelp: "Dynamische Hilfe",
    contextLoaded: "Kontext geladen",
    portalContext: "Portal-Kontext",
    secureHub: "Sicheres Intranet-Zentrum",
    switchHub: "Standort-Hub wechseln",
    workplaceHelpdesks: "Arbeitsplatz-Helpdesks",
    regionalHrPartner: "Regionaler HR-Business Partner",
    itHelpdesk: "IT-Bereitstellung & Support",
    officeAddress: "Adresse der Niederlassung",
    closeBtn: "Details schließen",
    active: "Aktiv",
    consoleTitle: "BestFrAIend Suchkonsole",
    consoleDesc: "Greifen Sie in Echtzeit auf interne Richtlinien, IT-Konformitätswikis, FAQs und Sofortantworten zu.",
    searchPlaceholder: "Fragen Sie die Regeln, z.B. 'Wie verbinde ich mich mit dem VPN?'",
    askBtn: "Konsole fragen",
    newsBrief: "Unternehmens-News Flash",
    meetingsBrief: "Wöchentliche Besprechungsübersicht",
    nextSync: "Nächster Sync",
    openPlanner: "Tagesplaner öffnen",
    quickActions: "Schnellaktionen",
    exploreDirectories: "Richtlinien durchsuchen",
    corporateArchives: "Unternehmensarchive",
    usersActive: "Aktive Benutzer",
    openTickets: "Offene Tickets",
    requestPto: "Urlaub beantragen",
    reportIssue: "Problem melden",
    fileExpense: "Spesenabrechnung",
    bookDesk: "Schreibtisch buchen",
    ptoBalance: "Urlaubskonto: 24 Tage",
    itFacilitySupport: "IT- / Gebäude-Support",
    sapConcur: "SAP Concur Anmeldung",
    officeHubSeats: "Arbeitsplatz-Buchung",
    newJoinerGuide: "Leitfaden für neue Mitarbeiter",
    checklistSubtitle: "Checkliste",
    completePercent: "Abgeschlossen",
    openPortal: "Onboarding-Portal öffnen",
    cmdKSearch: "Cmd + K zum Suchen",
    cmdKPlaceholder: "Navigation durchsuchen oder Frage eingeben...",
    bestFriendSolution: "BestFrAIend Lösung",
    continueConversation: "Unterhaltung fortsetzen",
    helpFaqs: "Hilfe & FAQs",
    onboardingTab: "Einarbeitung",
  },
  FR: {
    dashboard: "Tableau de Bord",
    chat: "Chat BestFrAIend",
    policyLibrary: "Bibliothèque de Règles",
    aiHub: "Hub d'Innovation IA",
    orgFeed: "Fil d'Actualités",
    directory: "Annuaire Collaborateurs",
    contactHr: "Contacter les RH",
    dynamicHelp: "Aide Dynamique",
    contextLoaded: "Contexte Chargé",
    portalContext: "Contexte du Portail",
    secureHub: "Intranet Sécurisé",
    switchHub: "Changer de Hub de Travail",
    workplaceHelpdesks: "Assistance Bureau Local",
    regionalHrPartner: "Partenaire RH Régional",
    itHelpdesk: "Support Approvisionnement IT",
    officeAddress: "Adresse du Bureau Régional",
    closeBtn: "Fermer les Coordonnées",
    active: "Actif",
    consoleTitle: "BestFrAIend Console de Recherche",
    consoleDesc: "Accédez en temps réel aux règles internes, wiki de conformité IT, FAQ et réponses instantanées.",
    searchPlaceholder: "Posez votre question, ex. 'Comment se connecter au VPN ?'",
    askBtn: "Demander",
    newsBrief: "Flash d'Actualités",
    meetingsBrief: "Synthèse des Réunions",
    nextSync: "Prochaine Réunion",
    openPlanner: "Ouvrir l'Agenda",
    quickActions: "Actions Rapides",
    exploreDirectories: "Explorer les Répertoires",
    corporateArchives: "Archives de l'Entreprise",
    usersActive: "Utilisateurs Actifs",
    openTickets: "Tickets Ouverts",
    requestPto: "Demander un Congé",
    reportIssue: "Signaler un Problème",
    fileExpense: "Note de Frais",
    bookDesk: "Réserver un Bureau",
    ptoBalance: "Solde : 24 jours",
    itFacilitySupport: "Support IT & Logistique",
    sapConcur: "Connexion SAP Concur",
    officeHubSeats: "Places de Travail",
    newJoinerGuide: "Guide d'Intégration",
    checklistSubtitle: "Feuille de route",
    completePercent: "Complété",
    openPortal: "Accéder au Portail",
    cmdKSearch: "Cmd + K pour rechercher",
    cmdKPlaceholder: "Rechercher ou poser une question...",
    bestFriendSolution: "Solution BestFrAIend",
    continueConversation: "Continuer la discussion",
    helpFaqs: "FAQ Aide",
    onboardingTab: "Intégration",
  }
};
