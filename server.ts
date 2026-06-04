import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Synthetic Data
const ORG_FEED = [
  // --- NEWS ---
  {
    id: "1",
    type: "news",
    title: "Warsaw - New Exadel Innovation Hub",
    description: "Our Warsaw team is moving to a new state-of-the-art office in Warsaw Spire. Grand opening Q3.",
    date: "2026-06-01",
    category: "Operations",
    region: "PL"
  },
  {
    id: "2",
    type: "news",
    title: "Croatia - Zagreb Office Expansion",
    description: "New collaboration spaces and wellness rooms now available for the Zagreb team.",
    date: "2026-06-05",
    category: "General",
    region: "HR"
  },
  {
    id: "3",
    type: "news",
    title: "US/CA - Benefit Enrollment",
    description: "Annual health and tax benefit election starts next week for North American employees.",
    date: "2026-06-01",
    category: "HR",
    region: "US"
  },
  {
    id: "4",
    type: "news",
    title: "Germany - Remote Stipend Update",
    description: "Revised home office and internet reimbursement guidelines for DE-based consultants.",
    date: "2026-06-10",
    category: "Finance",
    region: "DE"
  },
  {
    id: "5",
    type: "news",
    title: "Welcome New Employees!",
    description: "Our new onboarding digital twin is now live in the 'BestFrAIend' dashboard. Check your regional quick actions.",
    date: "2026-06-02",
    category: "HR",
    region: "Global"
  },

  // --- EVENTS ---
  {
    id: "e_pl",
    type: "event",
    title: "Warsaw Spire Tech Talk: Prompting & RAG Systems",
    description: "Join the local Warsaw AI cell for a hands-on workshop on optimizing context window indexing in Polish & English.",
    date: "2026-06-18",
    category: "IT",
    region: "PL"
  },
  {
    id: "e_hr",
    type: "event",
    title: "Zagreb Midsummer Team BBQ & Networking",
    description: "A relaxed outdoor social event with regional leadership at Lake Jarun. Drinks and catering provided.",
    date: "2026-06-20",
    category: "General",
    region: "HR"
  },
  {
    id: "e_de",
    type: "event",
    title: "Berlin AI Ethics Forum",
    description: "Reviewing secure VPN topologies and local GDPR requirements for public LLM proxying. Highly recommended for DE-based tech leads.",
    date: "2026-06-25",
    category: "Legal",
    region: "DE"
  },
  {
    id: "e_us",
    type: "event",
    title: "US Advantage Plans Q&A Panel",
    description: "Dedicated virtual Q&A session on the upcoming premium wellness incentives and 401k match structure changes.",
    date: "2026-06-12",
    category: "HR",
    region: "US"
  },
  {
    id: "e_global",
    type: "event",
    title: "Global Town Hall: Exadel AI Vision 2026",
    description: "Our CEO and Regional Heads present the roadmap for autonomous coding assistants, client-side safety guardrails, and enterprise APIs.",
    date: "2026-06-15",
    category: "Operations",
    region: "Global"
  },

  // --- JOBS ---
  {
    id: "j_pl",
    type: "job",
    title: "Senior AI Prompt Engineer",
    description: "Develop enterprise-grade agent instructions and orchestrate semantic indexing. Warsaw Spire hybrid model with Medicover benefits.",
    date: "2026-06-02",
    category: "IT",
    region: "PL"
  },
  {
    id: "j_hr",
    type: "job",
    title: "AI Compliance Officer (Tax & Legal)",
    description: "Govern cross-border digital nomad filings and ensure safe regional policy databases. Zagreb Matrix Office hybrid framework.",
    date: "2026-06-04",
    category: "Legal",
    region: "HR"
  },
  {
    id: "j_de",
    type: "job",
    title: "TypeScript / Full-Stack Engineer",
    description: "Architect internal tools for regional HR portal integration, including PDF archiving tools. Core Node + React stack. Berlin hub or fully remote.",
    date: "2026-06-06",
    category: "IT",
    region: "DE"
  },
  {
    id: "j_us",
    type: "job",
    title: "HR Regional Coordinator",
    description: "Lead onboarding workflows, coordinate local benefit plans, and manage tax-nexus allocations. Remote US/CA.",
    date: "2026-06-01",
    category: "HR",
    region: "US"
  },
  {
    id: "j_global",
    type: "job",
    title: "Technical Team Lead - LLM Tooling",
    description: "Coordinate cross-continental engineering sprints between EU hubs and US remote engineers, building low-latency API wrappers.",
    date: "2026-06-03",
    category: "IT",
    region: "Global"
  }
];

const KNOWLEDGE_BASE = [
  {
    id: "p1",
    title: "PTO and Vacation Policy",
    content: "Standard accrual varies by contract type and seniority. Regional specific rules apply.",
    category: "HR",
    tags: ["vacation", "time off", "pto"],
    regions: {
      DE: "Germany: 30 days standard for most full-time contracts under federal guidelines.",
      PL: "Poland: 20 or 26 days based on tenure and education. Use the Exadel Portal for 'Urlop' requests.",
      HR: "Croatia: 20 business days minimum + statutory additional days based on seniority or hard working conditions.",
      FR: "France: 25 days RTT + 5 weeks paid leave (Congés Payés) standard.",
      US: "US: Unlimited Flexible Time Off (FTO) for salaried roles; accrued for hourly staff.",
      CA: "Canada: 15-20 days standard based on standard provincial variations.",
      GE: "Georgia: 24 business days standard. Approved and logged through local Exadel HR Portal tool.",
      BR: "Brazil: 30 consecutive calendar days of paid vacation after 1 year of employment (governed by CLT rules).",
      CL: "Chile: 15 business days standard. Submit to regional LATAM coordination lead.",
      BY: "Belarus: 24 calendar days minimum standard under local labor code."
    }
  },
  {
    id: "p2",
    title: "Travel & Expense (T&E)",
    content: "Receipts required over $10. Submit within 30 days via internal tools.",
    category: "Finance",
    tags: ["money", "expenses", "travel"],
    regions: {
      DE: "Germany: Standard 'Verpflegungsmehraufwand' rates apply for travel duration allowances.",
      PL: "Poland: Per diem (dieta) is 45 PLN for domestic. International follows national rates.",
      HR: "Croatia: Domestic per diem (dnevnica) is 26.54 EUR.",
      FR: "France: Standard URSSAF daily allowances for national business travel.",
      US: "US: Per diem follows IRS GSA rates. Car mileage: 67 cents/mile.",
      CA: "Canada: Regional per diems in CAD. Mileage follows national CRA rates.",
      GE: "Georgia: Standard regional daily per diem or receipted expense reimbursements.",
      BR: "Brazil: Expense claims submitted in BRL with proper corporate invoice (Nota Fiscal).",
      CL: "Chile: Expense claims submitted in CLP with legal receipt (boleta).",
      BY: "Belarus: Business travel per diems follow national Ministry of Finance rules."
    }
  },
  {
    id: "p3",
    title: "Health & Benefits Hub",
    content: "Local providers manage primary health network and supplemental wellness.",
    category: "HR",
    tags: ["insurance", "health", "benefits"],
    regions: {
      DE: "Germany: Co-funded public insurance or select high-tier private coverage partner details.",
      PL: "Poland: Medicover/Luxmed private medical system + MultiSport card available.",
      HR: "Croatia: Supplemental HZZO coverage + local wellness vouchers.",
      FR: "France: Mutuelle coverage + Ticket Restaurant vouchers standard.",
      US: "US: Blue Cross Blue Shield healthcare plans + 401k Matching (5%).",
      CA: "Canada: SunLife Supplemental health plan + RRSP Matching.",
      GE: "Georgia: Local Ardi medical provider network + gym allowance.",
      BR: "Brazil: Private medical coverage (Bradesco/SulAmérica) + Vale-Refeição food allowances.",
      CL: "Chile: Supplemental health insurance (Fonasa/Isapre integration) + dental booster.",
      BY: "Belarus: Private medical insurance with Belneftekhim or Belgosstrakh + local wellness package."
    }
  },
  {
    id: "p4",
    title: "Onboarding: Your First 30 Days",
    content: "Day 1: Setup hardware. Day 7: Complete security training. Day 30: First performance sync.",
    category: "HR",
    tags: ["new hire", "onboarding", "guide"],
    regions: {
      DE: "Berlin: Virtual setup sessions at 9 AM CET. Onboarding kit shipped to home address.",
      PL: "Warsaw: Badge collection at Warsaw Spire Reception. Coffee with mentor at 10 AM.",
      HR: "Zagreb: New joiner lunch at 1 PM. IT setup in the Matrix building.",
      FR: "Paris: Onboarding kit shipped home, breakfast sync with Paris lead at 9:30 AM CET.",
      US: "US: Secure CDW package delivery. Remote IT orientation at 10 AM PST.",
      CA: "Canada: Sync with Montreal/Toronto remote peer. Onboarding check-in on Day 2.",
      GE: "Tbilisi: Collect badge & laptop at Chavchavadze Tech Office. Mentor lunch at 1 PM.",
      BR: "São Paulo: IT setup session remote, check in with São Paulo HR at 11 AM local.",
      CL: "Santiago: Welcome lunch at 1:30 PM local. Laptop setup session via Santiago IT partner.",
      BY: "Minsk: Laptop pickup at Minsk Office IT desk. Day 1 team greeting at 10 AM.",
      Global: "Check your local Slack channel for office-specific first-day protocols."
    }
  },
  {
    id: "p5",
    title: "Information Compliance & Device Security Policy",
    content: "Workstations must run corporate security agents (OKTA, CrowdStrike) and connect with regional VPN hubs.",
    category: "IT",
    tags: ["security", "vpn", "laptop", "it"],
    regions: {
      DE: "Germany: Strict GDPR client restrictions. Hardware returned to Berlin workspace context and VPN node DE-Berlin.",
      PL: "Poland: Hardware replacement at Warsaw Spire 8th floor IT room. VPN node PL-Spire.",
      HR: "Croatia: Hardware handled via Zagreb IT team in Matrix building. VPN node HR-Zagreb.",
      FR: "France: Strict compliance with EU GDPR & CNIL guidelines. VPN node FR-Paris.",
      US: "US: Multi-factor OKTA authentication mandatory. Hardware shipped directly from partner CDW.",
      CA: "Canada: Canada IT operations sync. Use secure VPN node CA-Toronto.",
      GE: "Georgia: Tech support via Tbilisi IT hub. VPN node GE-Tbilisi.",
      BR: "Brazil: Compliance with LGPD law in Brazil. VPN node BR-SaoPaulo.",
      CL: "Chile: Hardware and device security handled via regional LATAM IT lead. VPN node CL-Santiago.",
      BY: "Belarus: Hardware support at IT Desk Minsk. VPN node BY-Minsk."
    }
  },
  {
    id: "p6",
    title: "Working Across Borders & Nomad Policy",
    content: "Employees are compliant to work remotely from high-trust jurisdictions for up to 30 calendar days per rolling year. Managerial sign-off is required.",
    category: "Legal",
    tags: ["compliance", "nomad", "legal", "taxes"],
    regions: {
      DE: "Germany: EU Schengen requirements apply. Specific client data residency restrictions.",
      PL: "Poland: Subject to EU-wide tax residency rules. Requires A1 Social Security certificate.",
      HR: "Croatia: Double taxation agreement rules apply for non-EU travel. Notify local HR.",
      FR: "France: Remote work authorization inside EU Schengen area subject to French labour law and A1 verification.",
      US: "US: State-to-state tax nexus limits apply. Working outside home state over 14 days requires payroll notifying.",
      CA: "Canada: Cross-province travel limits active. Inter-state compliance holds apply.",
      GE: "Georgia: Dynamic tax status guidelines for foreign source income and individual entrepreneurs.",
      BR: "Brazil: Cross-border arrangements require written annex and local legal review under CLT.",
      CL: "Chile: Working remotely outside Chile requires strict approval to avoid double taxation issues.",
      BY: "Belarus: Subject to national labor laws for remote and combined forms of employment."
    }
  },
  {
    id: "p7",
    title: "Workplace Health, Safety & Flexible Work Policy",
    content: "Exadel operates a hybrid workforce approach. Hub spaces can be booked in advance for team meets and collaborative design sprints.",
    category: "General",
    tags: ["office", "hybrid", "booking", "general"],
    regions: {
      DE: "Germany: Co-working hubs in Berlin and Frankfurt. Advance reservations required.",
      PL: "Poland: Warsaw Spire office requires biometric/card access. Catered lunch on Wednesdays.",
      HR: "Croatia: Zagreb office in Matrix Building utilizes booking app 'MatrixDesk' for desks.",
      FR: "France: Secure flex work spaces in Paris and remote work stipends under local agreement.",
      US: "US: Headquartered in California, fully remote with regional co-working stipends.",
      CA: "Canada: Flex hotdesking partners in Toronto. Access passes issued by regional admin.",
      GE: "Georgia: Tech-office hybrid space in Tbilisi. Advance desk booking recommended.",
      BR: "Brazil: São Paulo office on Av. Paulista with hybrid hot-desking setup.",
      CL: "Chile: Co-working hubs in Santiago. Submit office-day bookings via local team channel.",
      BY: "Belarus: Hybrid work spaces and dedicated workstations available at Minsk Dev Hub."
    }
  }
];

const FAQS = [
  { id: "f1", question: "How do I reset my password?", answer: "Use OKTA self-service or check the #it-help Slack channel.", category: "IT" },
  { id: "f2", question: "Who is my regional HR lead?", answer: "PL: Anna Kowalska | HR: Marko Horvat | US/CA: Mark Thompson | DE: Elena Wagner", category: "HR" },
  { id: "f3", question: "Work from another country?", answer: "Allowed for up to 30 days/year via 'Nomad' request for tax compliance. Manager approval required.", category: "Legal" }
];

const TICKETS = [
  { id: "t1", title: "Regional VPN Node Access - Warsaw", status: "open", assignee: "Alex Chen", date: "2026-06-01" },
  { id: "t2", title: "Hardware Procurement (Zagreb Hub)", status: "in-progress", assignee: "Sarah Miller", date: "2026-05-30" },
  { id: "t3", title: "Monitor replacement (Berlin Office)", status: "resolved", assignee: "Elena Wagner", date: "2026-05-25" }
];

const MEETINGS = [
  { id: "m1", title: "EU Engineering Sync", date: "2026-05-30", summary: "Integrating communications across Warsaw, Zagreb, and Berlin hubs. Focus on cross-region pairing." },
  { id: "m2", title: "Global HR: Local Addenda Audit", date: "2026-06-02", summary: "Ensuring all regional policies are reflected in the 'BestFrAIend' assistant." }
];

const AI_INITIATIVES = [
  { id: "ai1", title: "Geo-Aware Expert System", description: "Enabling regional-first document retrieval for our internal bot.", status: "active", type: "initiative" },
  { id: "ai2", title: "Multilingual Support", description: "Native support for Polish, Croatian, and German queries.", status: "active", type: "initiative" },
  { id: "news1", title: "Llama-3.3 EU Fine-Tuning Completed", description: "Our Warsaw AI pod successfully optimized a fine-tuned 70B parameters model, achieving 98.7% compliance safety ratings on local Polish and EU HR FAQs.", status: "completed", type: "news" },
  { id: "news2", title: "DeepSeek Reasoning Pipeline Integrated", description: "We have fully deployed DeepSeek-R1 reasoning networks to handle complex legal and taxation pipelines while maintaining absolute local GDPR data isolation.", status: "active", type: "news" },
  { id: "news3", title: "Bilingual Speech-to-Intent Pilot Live", description: "Our Zagreb team launched a voice micro-agent supporting translation and quick voice-to-policy lookups in Croatian, Polish, German, French, and English.", status: "pilot", type: "news" },
  
  // Regional AI Events occurring at the "AI Innovation Hub"
  {
    id: "aie1",
    title: "Warsaw Spire AI Prompt-thon",
    description: "Hands-on team workshop for zero-shot prompt scaling, local RAG configurations, and context-window engineering.",
    status: "event",
    type: "event",
    region: "PL",
    date: "June 18, 2026 at 3:00 PM CET",
    location: "Room 8.4 'Copernicus', Warsaw Spire & Zoom"
  },
  {
    id: "aie2",
    title: "Zagreb Generative Design Meetup",
    description: "Interactive session exploring real-time canvas rendering, web components loading, and dynamic front-end AI integrations.",
    status: "event",
    type: "event",
    region: "HR",
    date: "June 20, 2026 at 4:30 PM CET",
    location: "Zagreb Matrix Hub & Teams"
  },
  {
    id: "aie3",
    title: "Berlin AI Ethics & GDPR Sync",
    description: "Critical walkthrough of corporate safety policies, client IP protection, and regional GDPR compliance for developers.",
    status: "event",
    type: "event",
    region: "DE",
    date: "June 25, 2026 at 11:30 AM CET",
    location: "Virtual Hub (Berlin Node DE-Berlin)"
  },
  {
    id: "aie4",
    title: "Silicon Valley AI Agents Roundtable",
    description: "Roundtable discussion on multi-agent frameworks, task delegation pipelines, and feedback-loop control architectures.",
    status: "event",
    type: "event",
    region: "US",
    date: "June 29, 2026 at 2:00 PM PST",
    location: "Bay Area Lab & Zoom link"
  },
  {
    id: "aie5",
    title: "Toronto Bilingual NLP Panels",
    description: "Collaborative event on expanding translation accuracy, regional dialects indexing, and localized dual-language models.",
    status: "event",
    type: "event",
    region: "CA",
    date: "July 2, 2026 at 1:00 PM EST",
    location: "Virtual - Zoom Meeting"
  },
  {
    id: "aie6",
    title: "Global AI Summit 2026: The New Frontier",
    description: "Dynamic showcase of product milestones, client deployment case studies, and next-generation autonomous coding assistants.",
    status: "event",
    type: "event",
    region: "Global",
    date: "July 5, 2026 at 5:00 PM GMT",
    location: "Exadel Tech Twitch Channel & Meta-Hub Space"
  }
];

const WEEKLY_DIGEST = {
  week: "June 1-7, 2026",
  impact: "Global Expansion",
  summaries: [
    { title: "Warsaw Spire Office", body: "Our new Poland HQ is now fully operational." },
    { title: "Croatia Benefits", body: "Revised wellness packages launched for Zagreb-based teams." },
    { title: "DE/EU Integration", body: "Standardizing benefit platforms across the European hubs." }
  ],
  action: "Select your region in the dashboard to see your personalized feed."
};

const EMPLOYEES = [
  { id: "e1", name: "Jane Doe", role: "Senior Analyst", dept: "Operations", status: "online", email: "j.doe@exadel.com", region: "PL" },
  { id: "e2", name: "Alex Chen", role: "DevOps Engineer", dept: "IT Support", status: "online", email: "a.chen@exadel.com", region: "HR" },
  { id: "e3", name: "Sarah Miller", role: "Finance Director", dept: "Finance", status: "away", email: "s.miller@exadel.com", region: "US" },
  { id: "e4", name: "David Park", role: "HR Specialist", dept: "HR", status: "offline", email: "d.park@exadel.com", region: "CA" },
  { id: "e5", name: "Elena Wagner", role: "Regional Lead", dept: "Operations", status: "online", email: "e.wagner@exadel.com", region: "DE" }
];

// Gemini AI Setup
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
});

// API Routes
const translationCache = new Map<string, any>();

const TRANSLATION_MAP: Record<string, Record<string, string>> = {
  // Feed Title/Desc
  "Warsaw - New Exadel Innovation Hub": {
    PL: "Warszawa - Nowe Centrum Innowacji Exadel",
    HR: "Varšava - Novi Exadel inovacijski centar",
    DE: "Warschau - Neues Exadel Innovation Hub",
    FR: "Varsovie - Nouveau pôle d'innovation Exadel"
  },
  "Our Warsaw team is moving to a new state-of-the-art office in Warsaw Spire. Grand opening Q3.": {
    PL: "Nasz warszawski zespół przenosi się do nowego, nowoczesnego biura w Warsaw Spire. Wielkie otwarcie w Q3.",
    HR: "Naš tim u Varšavi seli se u novi vrhunski ured u Warsaw Spire. Svečano otvorenje u trećem kvartalu.",
    DE: "Unser Warschauer Team zieht in ein neues, hochmodernes Büro im Warsaw Spire um. Eröffnung im 3. Quartal.",
    FR: "Notre équipe de Varsovie déménage dans de nouveaux bureaux ultramodernes au Warsaw Spire. Grande ouverture au T3."
  },
  "Croatia - Zagreb Office Expansion": {
    PL: "Chorwacja - Rozbudowa biura w Zagrzebiu",
    HR: "Hrvatska - Proširenje ureda u Zagrebu",
    DE: "Kroatien - Standorterweiterung in Zagreb",
    FR: "Croatie - Expansion du bureau de Zagreb"
  },
  "New collaboration spaces and wellness rooms now available for the Zagreb team.": {
    PL: "Nowe przestrzenie do współpracy i pokoje relaksu są już dostępne dla zespołu w Zagrzebiu.",
    HR: "Novi prostori za suradnju i sobe za opuštanje sada su dostupni zagrebačkom timu.",
    DE: "Neue Kollaborationsbereiche und Wellnessräume stehen dem Team in Zagreb jetzt zur Verfügung.",
    FR: "De nouveaux espaces de collaboration et des salles de bien-être sont désormais disponibles pour l'équipe de Zagreb."
  },
  "US/CA - Benefit Enrollment": {
    PL: "USA/Kanada - Zapisy na świadczenia",
    HR: "SAD/Kanada - Upis beneficija",
    DE: "USA/Kanada - Anmeldung für Zusatzleistungen",
    FR: "USA/Canada - Inscription aux avantages sociaux"
  },
  "Annual health and tax benefit election starts next week for North American employees.": {
    PL: "Roczny wybór świadczeń zdrowotnych i podatkowych rozpoczyna się w przyszłym tygodniu dla pracowników w Ameryce Północnej.",
    HR: "Godišnji izbor zdravstvenih i poreznih povlastica počinje sljedeći tjedan za zaposlenike u Sjevernoj Americi.",
    DE: "Die jährliche Wahl der Krankenversicherungs- und Steuervergünstigungen beginnt nächste Woche für nordamerikanische Mitarbeiter.",
    FR: "Le choix annuel des prestations de santé et fiscales commence la semaine prochaine pour les employés d'Amérique du Nord."
  },
  "Germany - Remote Stipend Update": {
    PL: "Niemcy - Aktualizacja ryczałtu na pracę zdalną",
    HR: "Njemačka - Ažuriranje naknada za rad na daljinu",
    DE: "Deutschland - Update zur Homeoffice-Pauschale",
    FR: "Allemagne - Mise à jour de l'indemnité de télétravail"
  },
  "Revised home office and internet reimbursement guidelines for DE-based consultants.": {
    PL: "Zaktualizowane wytyczne dotyczące zwrotu kosztów biura domowego i internetu dla konsultantów w Niemczech.",
    HR: "Revidirane smjernice za nadoknadu troškova kućnog ureda i interneta za konzultante u Njemačkoj.",
    DE: "Überarbeitete Richtlinien zur Erstattung von Homeoffice- und Internetkosten für Berater in Deutschland.",
    FR: "Directives révisées de remboursement du travail à domicile et d'Internet pour les consultants basés en Allemagne."
  },
  "Welcome New Employees!": {
    PL: "Witamy nowych pracowników!",
    HR: "Dobrodošli novi zaposlenici!",
    DE: "Willkommen neue Mitarbeiter!",
    FR: "Bienvenue aux nouveaux employés !"
  },
  "Our new onboarding digital twin is now live in the 'BestFrAIend' dashboard. Check your regional quick actions.": {
    PL: "Nasz nowy cyfrowy bliźniak wdrożeniowy jest już aktywny w panelu 'BestFrAIend'. Sprawdź swoje regionalne szybkie działania.",
    HR: "Naš novi digitalni blizanac za onboarding sada je aktivan na ploči 'BestFrAIend'. Provjerite svoje lokalne brze akcije.",
    DE: "Unser neuer digitaler Onboarding-Zwilling ist jetzt im 'BestFrAIend'-Dashboard live. Überprüfen Sie Ihre regionalen Schnellaktionen.",
    FR: "Notre nouveau jumeau numérique d'intégration est désormais en ligne dans le tableau de bord 'BestFrAIend'. Vérifiez vos actions rapides régionales."
  },
  
  // Events
  "Warsaw Spire Tech Talk: Prompting & RAG Systems": {
    PL: "Warszawa Spire Tech Talk: Promptowanie i systemy RAG",
    HR: "Warsaw Spire Tech Talk: Prompting i RAG sustavi",
    DE: "Warsaw Spire Tech Talk: Prompting & RAG-Systeme",
    FR: "Tech Talk Warsaw Spire : Prompting & Systèmes RAG"
  },
  "Join the local Warsaw AI cell for a hands-on workshop on optimizing context window indexing in Polish & English.": {
    PL: "Dołącz do lokalnej warszawskiej komórki AI na praktyczne warsztaty z optymalizacji indeksowania okien kontekstowych w języku polskim i angielskim.",
    HR: "Pridružite se lokalnoj varšavskoj AI skupini na praktičnoj radionici o optimizaciji indeksiranja kontekstualnog prozora na poljskom i engleskom jeziku.",
    DE: "Nehmen Sie an einem praktischen Workshop der Warschauer KI-gruppe zur Optimierung der Kontextfenster-Indexierung auf Polnisch und Englisch teil.",
    FR: "Rejoignez la cellule IA locale de Varsovie pour un atelier pratique sur l'optimisation de l'indexation de la fenêtre de contexte en polonais et en anglais."
  },
  "Zagreb Midsummer Team BBQ & Networking": {
    PL: "Zagrzebskie letnie grillowanie i networking",
    HR: "Zagreb Midsummer Team BBQ & Networking",
    DE: "Zagreb Mittsommer Team-Grillfest & Networking",
    FR: "Barbecue de mi-été de l'équipe de Zagreb & Réseautage"
  },
  "A relaxed outdoor social event with regional leadership at Lake Jarun. Drinks and catering provided.": {
    PL: "Luźne spotkanie towarzyskie na świeżym powietrzu z regionalnym kierownictwem nad jeziorem Jarun. Zapewniamy napoje i catering.",
    HR: "Opušteno druženje na otvorenom s regionalnim vodstvom na jezeru Jarun. Piće i hrana osigurani.",
    DE: "Ein entspanntes geselliges Treffen im Freien mit der regionalen Führung am Jarun-See. Getränke und Catering werden gestellt.",
    FR: "Un événement social décontracté en plein air avec la direction régionale au lac Jarun. Boissons et service de traiteur fournis."
  },
  "Berlin AI Ethics Forum": {
    PL: "Berlińskie Forum Etyki AI",
    HR: "Berlin AI Ethics Forum",
    DE: "Berliner KI-Ethikforum",
    FR: "Forum d'éthique de l'IA à Berlin"
  },
  "Reviewing secure VPN topologies and local GDPR requirements for public LLM proxying. Highly recommended for DE-based tech leads.": {
    PL: "Przegląd bezpiecznych topologii VPN i lokalnych wymogów RODO na potrzeby publicznego proxy LLM. Wysoce zalecane dla liderów technicznych z Niemiec.",
    HR: "Pregled sigurnih VPN topologija i lokalnih GDPR zahtjeva za javno proxyiranje LLM-a. Preporučuje se tehničkim voditeljima u Njemačkoj.",
    DE: "Überprüfung sicherer VPN-Topologien und lokaler DSGVO-Anforderungen für das öffentliche LLM-Proxying. Sehr empfohlen für DE-Tech-Leads.",
    FR: "Examen des topologies VPN sécurisées et des exigences RGPD locales pour le proxying public de LLM. Fortement recommandé pour les responsables techniques basés en Allemagne."
  },
  "US Advantage Plans Q&A Panel": {
    PL: "Panel Q&A dot. planów świadczeń w USA",
    HR: "Panel s pitanjima i odgovorima o američkim programima pogodnosti",
    DE: "USA Advantage-Pläne Q&A-Runde",
    FR: "Panel de questions-réponses sur les plans d'avantages américains"
  },
  "Dedicated virtual Q&A session on the upcoming premium wellness incentives and 401k match structure changes.": {
    PL: "Dedykowana wirtualna sesja pytań i odpowiedzi na temat nadchodzących zachęt wellness i zmian w strukturze dopasowania 401k.",
    HR: "Posebna virtualna sesija pitanja i odgovora o nadolazećim poticajima za wellness i promjenama u strukturi 401k doprinosa.",
    DE: "Spezielle virtuelle Fragerunde zu den bevorstehenden Premium-Wellness-Incentives und Änderungen an der 401k-Match-Struktur.",
    FR: "Session virtuelle de questions-réponses dédiée sur les incitations au bien-être de qualité supérieure et les modifications de la structure d'abondement du plan 401k."
  },
  "Global Town Hall: Exadel AI Vision 2026": {
    PL: "Globalne spotkanie ogólne: Wizja Exadel AI 2026",
    HR: "Global Town Hall: Exadel AI Vision 2026",
    DE: "Global Town Hall: Exadel KI-Vision 2026",
    FR: "Global Town Hall : Exadel AI Vision 2026"
  },
  "Our CEO and Regional Heads present the roadmap for autonomous coding assistants, client-side safety guardrails, and enterprise APIs.": {
    PL: "Nasz CEO i dyrektorzy regionalni przedstawiają plan rozwoju autonomicznych asystentów kodowania, zabezpieczeń po stronie klienta i korporacyjnych interfejsów API.",
    HR: "Naš izvršni diretor i regionalni direktori predstavljaju plan razvoja autonomnih asistenata kodiranja, sigurnosnih ograda na strani klijenta i korporativnih API-ja.",
    DE: "Unser CEO und die regionalen Leiter präsentieren die Roadmap für autonome Codierungsassistenten, clientseitige Sicherheitsrichtlinien und Enterprise-APIs.",
    FR: "Notre PDG et les directeurs régionaux présentent la feuille de route des assistants de codage autonomes, des garde-fous de sécurité côté client et des API d'entreprise."
  },
  
  // Jobs
  "Senior AI Prompt Engineer": {
    PL: "Starszy Inżynier Promptów AI",
    HR: "Senior AI Prompt inženjer",
    DE: "Senior AI Prompt Engineer",
    FR: "Ingénieur de prompt IA senior"
  },
  "Develop enterprise-grade agent instructions and orchestrate semantic indexing. Warsaw Spire hybrid model with Medicover benefits.": {
    PL: "Tworzenie instrukcji dla agentów klasy enterprise i koordynacja indeksowania semantycznego. Model hybrydowy w Warsaw Spire z pakietem Medicover.",
    HR: "Razvoj uputa za agente korporativne klase i koordinacija semantičkog indeksiranja. Hibridni rad u Warsaw Spireu s Medicover pogodnostima.",
    DE: "Entwicklung von Agenten-Anweisungen für Unternehmen und Orchestrierung semantischer Indexierung. Hybridmodell im Warsaw Spire mit Medicover-Leistungen.",
    FR: "Développer des instructions d'agent de classe entreprise et orchestrer l'indexation sémantique. Modèle hybride Warsaw Spire avec avantages Medicover."
  },
  "AI Compliance Officer (Tax & Legal)": {
    PL: "Specjalista ds. zgodności AI (podatki i prawo)",
    HR: "AI službenik za usklađenost (porezi i pravo)",
    DE: "KI-Compliance-Officer (Steuern & Recht)",
    FR: "Responsable de la conformité de l'IA (Fiscalité & Juridique)"
  },
  "Govern cross-border digital nomad filings and ensure safe regional policy databases. Zagreb Matrix Office hybrid framework.": {
    PL: "Zarządzanie zgłoszeniami transgranicznych cyfrowych nomadów i zapewnienie bezpieczeństwa regionalnych baz polityki. Hybrydowe ramy w biurze Zagreb Matrix.",
    HR: "Upravljanje prekograničnim prijavama digitalnih nomada i osiguravanje sigurnih regionalnih baza pravila. Hibridni model u zagrebačkom uredu Matrix.",
    DE: "Steuerung grenzüberschreitender Anträge von digitalen Nomaden und Gewährleistung sicherer Datenbanken für regionale Richtlinien. Zagreb Matrix Office Hybridmodell.",
    FR: "Gérer les déclarations des nomades numériques transfrontaliers et garantir la sécurité des bases de données de politiques régionales. Cadre hybride du bureau Matrix de Zagreb."
  },
  "TypeScript / Full-Stack Engineer": {
    PL: "Programista TypeScript / Full-Stack",
    HR: "TypeScript / Full-Stack programer",
    DE: "TypeScript / Full-Stack-Entwickler",
    FR: "Ingénieur TypeScript / Full-Stack"
  },
  "Architect internal tools for regional HR portal integration, including PDF archiving tools. Core Node + React stack. Berlin hub or fully remote.": {
    PL: "Projektowanie wewnętrznych narzędzi do integracji regionalnego portalu HR, w tym narzędzi do archiwizacji PDF. Stack Node + React. Biuro w Berlinie lub praca w pełni zdalna.",
    HR: "Izrada internih alata za integraciju regionalnog HR portala, uključujući alate za arhiviranje PDF-a. Node + React. Ured u Berlinu ili potpuno daljinski.",
    DE: "Architektur interner Tools für die Integration regionaler HR-Portale, einschließlich PDF-Archivierungstools. Kern Node + React Stack. Berliner Hub oder vollständig remote.",
    FR: "Concevoir des outils internes pour l'intégration des portails RH régionaux, y compris des outils d'archivage PDF. Stack Node + React de base. Hub de Berlin ou entièrement à distance."
  },
  "HR Regional Coordinator": {
    PL: "Regionalny Koordynator HR",
    HR: "Regionalni HR koordinator",
    DE: "Regionaler HR-Koordinator",
    FR: "Coordonnateur régional des RH"
  },
  "Lead onboarding workflows, coordinate local benefit plans, and manage tax-nexus allocations. Remote US/CA.": {
    PL: "Prowadzenie procesów onboardingowych, koordynacja lokalnych planów świadczeń i zarządzanie alokacjami podatkowymi. Zdalnie USA/Kanada.",
    HR: "Vođenje procesa zapošljavanja, koordinacija lokalnih planova beneficija i upravljanje poreznim alokacijama. Daljinski SAD/Kanada.",
    DE: "Leitung von Onboarding-Workflows, Koordination lokaler Benefit-Pläne und Verwaltung von Steuer-Nexus-Allokationen. Remote USA/Kanada.",
    FR: "Diriger les flux de travail d'intégration, coordonner les plans d'avantages locaux et gérer les allocations de liens fiscaux. À distance ÉU/Canada."
  },
  "Technical Team Lead - LLM Tooling": {
    PL: "Lider Techniczny Zespołu - Narzędzia LLM",
    HR: "Tehnički voditelj tima - LLM alati",
    DE: "Technischer Teamleiter - KI-Tooling",
    FR: "Chef d'équipe technique - Outils LLM"
  },
  "Coordinate cross-continental engineering sprints between EU hubs and US remote engineers, building low-latency API wrappers.": {
    PL: "Koordynacja międzykontynentalnych sprintów inżynieryjnych między centrami w UE a zdalnymi inżynierami w USA, budowanie niskolatencyjnych API.",
    HR: "Koordinacija međukontinentalnih inženjerskih sprintova između EU centara i daljinskih inženjera u SAD-u, izrada brzih API-ja.",
    DE: "Koordination interkontinentaler Sprints zwischen EU-Hubs und US-Entwicklern zur Erstellung extrem schneller API-Wrapper.",
    FR: "Coordonner les sprints d'ingénierie intercontinentaux entre les hubs de l'UE et les ingénieurs à distance aux États-Unis, en créant des wrappers API à faible latence."
  },

  // Knowledge base items
  "PTO and Vacation Policy": {
    PL: "Polityka urlopowa i czas wolny",
    HR: "Politika godišnjih odmora i slobodnih dana",
    DE: "Urlaubs- und Freistellungsrichtlinie",
    FR: "Politique de congés payés et vacances"
  },
  "Standard accrual varies by contract type and seniority. Regional specific rules apply.": {
    PL: "Standardowy wymiar urlopu zależy od rodzaju umowy i stażu pracy. Obowiązują przepisy regionalne.",
    HR: "Standardni broj dana ovisi o vrsti ugovora i stažu. Primjenjuju se specifična lokalna pravila.",
    DE: "Der Standardurlaub variiert je nach Vertragsart und Betriebszugehörigkeit. Es gelten regionale Sonderregelungen.",
    FR: "Le cumul standard varie selon le type de contrat et l'ancienneté. Des règles spécifiques régionales s'appliquent."
  },
  "Travel & Expense (T&E)": {
    PL: "Podróże i wydatki służbowe (T&E)",
    HR: "Putovanja i troškovi (T&E)",
    DE: "Reisen & Spesenabrechnung (T&E)",
    FR: "Voyages & Notes de frais (T&E)"
  },
  "Receipts required over $10. Submit within 30 days via internal tools.": {
    PL: "Wymagane rachunki powyżej 10 USD. Prześlij w ciągu 30 dni za pomocą wewnętrznych narzędzi.",
    HR: "Računi su obavezni za iznose iznad 10 USD. Podnesite u roku od 30 dana putem internih alata.",
    DE: "Belege ab 10 $ erforderlich. Einreichung innerhalb von 30 Tagen über interne Tools.",
    FR: "Reçus requis pour plus de 10 $. Soumettre dans les 30 jours via les outils internes."
  },
  "Health & Benefits Hub": {
    PL: "Centrum Zdrowia i Świadczeń",
    HR: "Centar za zdravlje i beneficije",
    DE: "Gesundheits- & Leistungsnetzwerk",
    FR: "Portail Santé & Avantages sociaux"
  },
  "Local providers manage primary health network and supplemental wellness.": {
    PL: "Lokalni dostawcy zarządzają podstawową siecią opieki zdrowotnej i dodatkowym pakietem wellness.",
    HR: "Lokalni pružatelji usluga upravljaju primarnom zdravstvenom mrežom i dodatnim wellness programima.",
    DE: "Lokale Partner verwalten das primäre Gesundheitsnetzwerk und die zusätzliche betriebliche Gesundheitsförderung.",
    FR: "Les prestataires locaux gèrent le réseau de santé primaire et le bien-être complémentaire."
  },
  "Onboarding: Your First 30 Days": {
    PL: "Wdrożenie: Twoje pierwsze 30 dni",
    HR: "Onboarding: Vaših prvih 30 dana",
    DE: "Onboarding: Ihre ersten 30 Tage",
    FR: "Intégration : Vos 30 premiers jours"
  },
  "Day 1: Setup hardware. Day 7: Complete security training. Day 30: First performance sync.": {
    PL: "Dzień 1: Konfiguracja sprzętu. Dzień 7: Ukończenie szkolenia z bezpieczeństwa. Dzień 30: Pierwsze podsumowanie wyników.",
    HR: "Dan 1: Postavljanje hardvera. Dan 7: Sigurnosni trening. Dan 30: Prvi razgovor o učinku.",
    DE: "Tag 1: Hardware einrichten. Tag 7: Sicherheitstraining abschließen. Tag 30: Erstes Feedback-Gespräch.",
    FR: "Jour 1 : Configuration du matériel. Jour 7 : Formation à la sécurité complète. Jour 30 : Premier suivi des performances."
  },
  "Information Compliance & Device Security Policy": {
    PL: "Zgodność informacji i polityka bezpieczeństwa urządzeń",
    HR: "Usklađenost informacija i sigurnost uređaja",
    DE: "Informations-Compliance & Gerätesicherheitsrichtlinie",
    FR: "Conformité de l'information & Sécurité des appareils"
  },
  "Workstations must run corporate security agents (OKTA, CrowdStrike) and connect with regional VPN hubs.": {
    PL: "Stacje robocze muszą mieć uruchomione korporacyjne agenty bezpieczeństwa (OKTA, CrowdStrike) i łączyć się z regionalnymi węzłami VPN.",
    HR: "Radne stanice moraju imati instalirane sigurnosne programe (OKTA, CrowdStrike) i spajati se na lokalne VPN čvorove.",
    DE: "Arbeitsplatzrechner müssen Sicherheitssoftware (OKTA, CrowdStrike) ausführen und sich mit regionalen VPN-Knoten verbinden.",
    FR: "Les postes de travail doivent exécuter des agents de sécurité d'entreprise (OKTA, CrowdStrike) et se connecter aux hubs VPN régionaux."
  },
  "Working Across Borders & Nomad Policy": {
    PL: "Praca transgraniczna i polityka nomadów",
    HR: "Rad preko granice i politika digitalnih nomada",
    DE: "Grenzüberschreitendes Arbeiten & Nomad-Richtlinie",
    FR: "Travail transfrontalier & Politique des nomades"
  },
  "Employees are compliant to work remotely from high-trust jurisdictions for up to 30 calendar days per rolling year. Managerial sign-off is required.": {
    PL: "Pracownicy mogą pracować zdalnie z jurysdykcji o wysokim zaufaniu przez maksymalnie 30 dni kalendarzowych w roku. Wymagana jest zgoda menedżera.",
    HR: "Zaposlenici mogu raditi na daljinu iz visokopovjerljivih zemalja do 30 kalendarskih dana godišnje uz odobrenje menadžera.",
    DE: "Mitarbeiter sind berechtigt, bis zu 30 Kalendertage pro rollierendem Jahr aus Ländern mit hohem Vertrauensstatus remote zu arbeiten. Die Genehmigung des Vorgesetzten ist erforderlich.",
    FR: "Les employés sont autorisés à travailler à distance depuis des juridictions de confiance jusqu'à 30 jours civils par an. L'approbation du gestionnaire est requise."
  },
  "Workplace Health, Safety & Flexible Work Policy": {
    PL: "Bezpieczeństwo w miejscu pracy i elastyczne formy zatrudnienia",
    HR: "Zdravlje na radu, sigurnost i fleksibilan rad",
    DE: "Gesundheitsschutz, Arbeitssicherheit & Flexibles Arbeiten",
    FR: "Santé au travail, sécurité & Politique de travail flexible"
  },
  "Exadel operates a hybrid workforce approach. Hub spaces can be booked in advance for team meets and collaborative design sprints.": {
    PL: "Exadel działa w modelu hybrydowym. Przestrzenie biurowe można rezerwować z wyprzedzeniem na spotkania zespołowe i warsztaty projektowe.",
    HR: "Exadel posluje u hibridnom modelu. Radni prostori se mogu rezervirati unaprijed za sastanke timova i radionice.",
    DE: "Exadel verfolgt einen Hybrid-Ansatz. Hub-Arbeitsplätze können im Voraus für Teambesprechungen und gemeinsame Design-Sprints gebucht werden.",
    FR: "Exadel applique une approche de travail hybride. Les espaces de hub peuvent être réservés à l'avance pour les réunions d'équipe et les sprints de conception."
  },

  // FAQ Items
  "How do I reset my password?": {
    PL: "Jak mogę zresetować hasło?",
    HR: "Kako mogu ponovno postaviti lozinku?",
    DE: "Wie setze ich mein Passwort zurück?",
    FR: "Comment réinitialiser mon mot de passe ?"
  },
  "Use OKTA self-service or check the #it-help Slack channel.": {
    PL: "Skorzystaj z samoobsługi OKTA lub sprawdź kanał Slack #it-help.",
    HR: "Koristite OKTA samoposluživanje ili provjerite Slack kanal #it-help.",
    DE: "Verwenden Sie die OKTA-Selbstbedienung oder sehen Sie im Slack-Kanal #it-help nach.",
    FR: "Utilisez le portail OKTA ou consultez le canal Slack #it-help."
  },
  "Who is my regional HR lead?": {
    PL: "Kto jest moim regionalnym liderem HR?",
    HR: "Tko je moj lokalni voditelj ljudskih resursa?",
    DE: "Wer ist meine regionale HR-Leitung?",
    FR: "Qui est mon responsable RH régional ?"
  },
  "PL: Anna Kowalska | HR: Marko Horvat | US/CA: Mark Thompson | DE: Elena Wagner": {
    PL: "PL: Anna Kowalska | HR: Marko Horvat | USA/CA: Mark Thompson | DE: Elena Wagner",
    HR: "PL: Anna Kowalska | HR: Marko Horvat | SAD/CA: Mark Thompson | DE: Elena Wagner",
    DE: "PL: Anna Kowalska | HR: Marko Horvat | USA/CA: Mark Thompson | DE: Elena Wagner",
    FR: "PL : Anna Kowalska | HR : Marko Horvat | ÉU/Canada : Mark Thompson | DE : Elena Wagner"
  },
  "Work from another country?": {
    PL: "Praca z innego kraju?",
    HR: "Rad iz druge države?",
    DE: "Arbeiten aus einem anderen Land?",
    FR: "Travailler depuis un autre pays ?"
  },
  "Allowed for up to 30 days/year via 'Nomad' request for tax compliance. Manager approval required.": {
    PL: "Dozwolona do 30 dni/rok na podstawie wniosku 'Nomad' w celu zachowania zgodności podatkowej. Wymagana zgoda przełożonego.",
    HR: "Dopušteno do 30 dana godišnje putem zahtjeva 'Nomad' radi usklađenosti s porezima. Potrebno odobrenje menadžera.",
    DE: "Erlaubt für bis zu 30 Tage/Jahr über einen 'Nomad'-Antrag zur Einhaltung der Steuervorschriften. Genehmigung des Vorgesetzten erforderlich.",
    FR: "Autorisé jusqu'à 30 jours/an via la demande 'Nomade' pour la conformité fiscale. Approbation du manager requise."
  },

  // Tickets
  "Regional VPN Node Access - Warsaw": {
    PL: "Dostęp do lokalnego węzła VPN - Warszawa",
    HR: "Pristup lokalnom VPN čvoru - Varšava",
    DE: "Regionaler VPN-Knotenzugriff - Warschau",
    FR: "Accès au nœud VPN régional - Varsovie"
  },
  "Hardware Procurement (Zagreb Hub)": {
    PL: "Zakup sprzętu (Centrum w Zagrzebiu)",
    HR: "Nabava opreme (Zagrebačko sjedište)",
    DE: "Hardwarebeschaffung (Zagreb Hub)",
    FR: "Approvisionnement en matériel (Hub de Zagreb)"
  },
  "Monitor replacement (Berlin Office)": {
    PL: "Wymiana monitora (Biuro w Berlinie)",
    HR: "Zamjena monitora (Ured u Berlinu)",
    DE: "Monitor-Austausch (Berliner Büro)",
    FR: "Remplacement d'écran (Bureau de Berlin)"
  },

  // AI Hub
  "Geo-Aware Expert System": {
    PL: "System ekspercki świadomy geolokalizacji",
    HR: "Geo-svjesni ekspertski sustav",
    DE: "Geo-bewusstes Expertensystem",
    FR: "Système expert géo-sensible"
  },
  "Enabling regional-first document retrieval for our internal bot.": {
    PL: "Umożliwienie wyszukiwania dokumentów z priorytetem regionalnym dla naszego wewnętrznego bota.",
    HR: "Omogućavanje regionalnog pretraživanja dokumenata za našeg internog bota.",
    DE: "Aktivierung der primär regionalen Dokumentensuche für unseren internen Bot.",
    FR: "Permettre l'extraction de documents de priorité régionale pour notre robot interne."
  },
  "Multilingual Support": {
    PL: "Obsługa wielojęzyczna",
    HR: "Višejezična podrška",
    DE: "Mehrsprachige Unterstützung",
    FR: "Support multilingue"
  },
  "Native support for Polish, Croatian, and German queries.": {
    PL: "Natywna obsługa zapytań w języku polskim, chorwackim i niemieckim.",
    HR: "Nativna podrška za hrvatske, poljske i njemačke upite.",
    DE: "Native Unterstützung für polnische, kroatische und deutsche Anfragen.",
    FR: "Support natif pour les requêtes en polonais, croate et allemand."
  },
  "Llama-3.3 EU Fine-Tuning Completed": {
    PL: "Ukończono dostrajanie Llama-3.3 dla UE",
    HR: "Dovršeno fino podešavanje modela Llama-3.3 u EU",
    DE: "Llama-3.3 EU-Feinabstimmung abgeschlossen",
    FR: "Ajustement fin de Llama-3.3 UE terminé"
  },
  "Our Warsaw AI pod successfully optimized a fine-tuned 70B parameters model, achieving 98.7% compliance safety ratings on local Polish and EU HR FAQs.": {
    PL: "Nasz warszawski zespół AI zoptymalizował dostrojony model z 70 miliardami parametrów, osiągając 98,7% zgodności pod kątem bezpieczeństwa dla lokalnych polskich i europejskich pytań i odpowiedzi HR.",
    HR: "Naš varšavski AI odjel uspješno je optimizirao prilagođeni model s 70B parametara, postigavši 98,7% sigurnosnih ocjena usklađenosti na poljskim i EU HR FAQs.",
    DE: "Unser Warschauer KI-Team hat ein feinabgestimmtes 70B-Parameter-Modell erfolgreich optimiert und eine Sicherheitsbewertung von 98,7 % für lokale polnische und EU-HR-FAQs erzielt.",
    FR: "Notre pod d'IA de Varsovie a optimisé avec succès un modèle affiné à 70 milliards de paramètres, atteignant un taux de sécurité de conformité de 98,7 % sur les FAQ RH locales polonaises et de l'UE."
  },
  "DeepSeek Reasoning Pipeline Integrated": {
    PL: "Zintegrowano potok wnioskowania DeepSeek",
    HR: "Integriran DeepSeek sustav zaključivanja",
    DE: "DeepSeek Reasoning Pipeline integriert",
    FR: "Pipeline de raisonnement DeepSeek intégré"
  },
  "We have fully deployed DeepSeek-R1 reasoning networks to handle complex legal and taxation pipelines while maintaining absolute local GDPR data isolation.": {
    PL: "W pełni wdrożyliśmy sieci wnioskowania DeepSeek-R1 do obsługi złożonych spraw prawnych i podatkowych, zachowując jednocześnie bezwzględną lokalną izolację danych RODO.",
    HR: "U potpunosti smo implementirali DeepSeek-R1 mreže za rješavanje složenih pravnih i poreznih pitanja, uz zadržavanje apsolutne izolacije lokalnih GDPR podataka.",
    DE: "Wir haben DeepSeek-R1 Reasoning-Netzwerke vollständig bereitgestellt, um komplexe Rechts- und Steuerprozesse zu bewältigen und gleichzeitig eine absolute lokale DSGVO-Datenisolierung aufrechtzuerhalten.",
    FR: "Nous avons entièrement déployé les réseaux de raisonnement DeepSeek-R1 pour gérer les pipelines juridiques et fiscaux complexes tout en maintenant une isolation absolue des données RGPD au niveau local."
  },
  "Bilingual Speech-to-Intent Pilot Live": {
    PL: "Pilotżowy dwujęzyczny system Speech-to-Intent aktywny",
    HR: "Dvojezični govor-u-namjeru pilot projekt aktivan",
    DE: "Bilinguales Sprach-zu-Intent-Pilotprojekt live",
    FR: "Pilote bilingue de reconnaissance de l'intent à partir de la parole en ligne"
  },
  "Our Zagreb team launched a voice micro-agent supporting translation and quick voice-to-policy lookups in Croatian, Polish, German, French, and English.": {
    PL: "Nasz zespół w Zagrzebiu uruchomił głosowego mikroagenta obsługującego tłumaczenia i szybkie wyszukiwanie zasad za pomocą głosu w językach chorwackim, polskim, niemieckim, francuskim i angielskim.",
    HR: "Naš zagrebački tim lansirao je glasovnog mikro-agenta koji podržava prevođenje i brzo pretraživanje pravila na hrvatskom, poljskom, njemačkom, francuskom i engleskom jeziku.",
    DE: "Unser Team in Zagreb hat einen Sprach-Mikroagenten gestartet, der Übersetzungen und schnelle Sprachabfragen zu Richtlinien auf Kroatisch, Polnisch, Deutsch, Französisch und Englisch unterstützt.",
    FR: "Notre équipe de Zagreb a lancé un micro-agent vocal prenant en charge la traduction et la recherche vocale rapide de politiques en croate, polonais, allemand, français et anglais."
  },

  // Digest Action Fallbacks & Ticker Feed Elements
  "Select your region in the dashboard to see your personalized feed.": {
    PL: "Wybierz swój region w panelu, aby zobaczyć spersonalizowany kanał.",
    HR: "Odaberite svoju regiju na ploči kako biste vidjeli svoj prilagođeni sadržaj.",
    DE: "Wählen Sie Ihre Region im Dashboard aus, um Ihren personalisierten Feed zu sehen.",
    FR: "Sélectionnez votre région dans le tableau de bord pour voir votre flux personnalisé."
  },
  "Your PL feed is active. Join the Warsaw Spire AI Prompt-thon on June 18!": {
    PL: "Twój kanał dla Polski jest aktywny. Dołącz do Warsaw Spire AI Prompt-thon już 18 czerwca!",
    HR: "Vaš poljski sadržaj je aktivan. Pridružite se Warsaw Spire AI Prompt-thonu 18. lipnja!",
    DE: "Ihr PL-Feed ist aktiv. Nehmen Sie am 18. Juni am Warsaw Spire AI Prompt-thon teil!",
    FR: "Votre flux Pologne est actif. Rejoignez le Prompt-thon IA de Warsaw Spire le 18 juin !"
  },
  "Your HR feed is active. Join the Zagreb Midsummer BBQ at Lake Jarun on June 20!": {
    PL: "Twój kanał dla Chorwacji jest aktywny. Dołącz do letniego grillowania w Zagrzebiu nad jeziorem Jarun już 20 czerwca!",
    HR: "Vaš hrvatski sadržaj je aktivan. Pridružite se zagrebačkom Midsummer BBQ-u na jezeru Jarun 20. lipnja!",
    DE: "Ihr HR-Feed ist aktiv. Nehmen Sie am 20. Juni am Zagreb Mittsommer-Grillfest am Jarun-See teil!",
    FR: "Votre flux Croatie est actif. Rejoignez le barbecue de mi-été de Zagreb au lac Jarun le 20 juin !"
  },
  "Your DE feed is active. Register for the Berlin AI Ethics & GDPR Sync on June 25!": {
    PL: "Twój kanał dla Niemiec jest aktywny. Zarejestruj się na Berlińskie Forum Etyki AI i RODO już 25 czerwca!",
    HR: "Vaš njemački sadržaj je aktivan. Registrirajte se za Berlin AI Ethics & GDPR Sync 25. lipnja!",
    DE: "Ihr DE-Feed ist aktiv. Registrieren Sie sich für den Berliner KI-Ethik & DSGVO-Sync am 25. Juni!",
    FR: "Votre flux Allemagne est actif. Inscrivez-vous à la session d'éthique de l'IA et du RGPD de Berlin le 25 juin !"
  },
  "Your US feed is active. Attend the Silicon Valley AI Agents Roundtable on June 29!": {
    PL: "Twój kanał dla USA jest aktywny. Weź udział w okrągłym stole asystentów AI w Dolinie Krzemowej już 29 czerwca!",
    HR: "Vaš američki sadržaj je aktivan. Sudjelujte na okruglom stolu o AI agentima u Silicijskoj dolini 29. lipnja!",
    DE: "Ihr US-Feed ist aktiv. Nehmen Sie am Silicon Valley AI Agents Roundtable am 29. Juni teil!",
    FR: "Votre flux ÉU est actif. Participez à la table ronde des agents d'IA de la Silicon Valley le 29 juin !"
  },
  "Your CA feed is active. Participate in the Toronto Bilingual NLP Panels on July 2!": {
    PL: "Twój kanał dla Kanady jest aktywny. Weź udział w dwujęzycznym panelu NLP w Toronto już 2 lipca!",
    HR: "Vaš kanadski sadržaj je aktivan. Sudjelujte u dvojezičnim NLP panelima u Torontu 2. srpnja!",
    DE: "Ihr CA-Feed ist aktiv. Nehmen Sie am 2. Juli an den Toronto Bilingual NLP Panels teil!",
    FR: "Votre flux Canada est actif. Participez aux panels NLP bilingues de Toronto le 2 juillet !"
  },
  "Global feed is active. Join us at the Global AI Summit on July 5!": {
    PL: "Kanał globalny jest aktywny. Dołącz do nas na Globalnym Szczycie AI już 5 lipca!",
    HR: "Globalni sadržaj je aktivan. Pridružite nam se na Global AI Summitu 5. srpnja!",
    DE: "Der globale Feed ist aktiv. Seien Sie am 5. Juli beim Global AI Summit dabei!",
    FR: "Le flux mondial est actif. Rejoignez-nous au Sommet mondial de l'IA le 5 juillet !"
  },

  // Weekly Digest Extra Meta
  "Global Expansion": {
    PL: "Globalna ekspansja",
    HR: "Globalna ekspanzija",
    DE: "Globale Expansion",
    FR: "Expansion mondiale"
  },
  "Eastern Europe Growth": {
    PL: "Rozwój w Europie Wschodniej",
    HR: "Rast u Istočnoj Europi",
    DE: "Wachstum in Osteuropa",
    FR: "Croissance en Europe de l'Est"
  },
  "Adria Regional Focus": {
    PL: "Nacisk na region Adriatyku",
    HR: "Regionalni fokus na Adria regiju",
    DE: "Adria-Regionalfokus",
    FR: "Focus régional Adriatique"
  },
  "West Europe Compliance": {
    PL: "Zgodność w Europie Zachodniej",
    HR: "Usklađenost u Zapadnoj Europi",
    DE: "Westeuropäische Compliance",
    FR: "Conformité en Europe de l'Ouest"
  },
  "North America Scale": {
    PL: "Skalowanie w Ameryce Północnej",
    HR: "Skaliranje u Sjevernoj Americi",
    DE: "Skalierung in Nordamerika",
    FR: "Échelle en Amérique du Nord"
  },
  "Bilingual Tech Advances": {
    PL: "Postępy w technologii dwujęzycznej",
    HR: "Dvojezični tehnološki napredak",
    DE: "Bilinguale Tech-Fortschritte",
    FR: "Progrès technologiques bilingues"
  },
  "Universal Alignment": {
    PL: "Uniwersalne dostosowanie",
    HR: "Univerzalno usklađivanje",
    DE: "Universelle Ausrichtung",
    FR: "Alignement universel"
  },

  // Digest summaries headlines & bodies
  "Warsaw Spire Office": { PL: "Biuro Warsaw Spire", HR: "Ured u Warsaw Spire", DE: "Büro im Warsaw Spire", FR: "Bureau du Warsaw Spire" },
  "Our new Poland HQ is now fully operational.": {
    PL: "Nasza nowa kwatera główna w Polsce jest już w pełni operacyjna.",
    HR: "Naše novo sjedište u Poljskoj sada je potpuno funkcionalno.",
    DE: "Unser neues Hauptquartier in Polen ist jetzt voll betriebsbereit.",
    FR: "Notre nouveau siège en Pologne est désormais pleinement opérationnel."
  },
  "Croatia Benefits": { PL: "Świadczenia w Chorwacji", HR: "Beneficije u Hrvatskoj", DE: "Vorteile in Kroatien", FR: "Avantages sociaux en Croatie" },
  "Revised wellness packages launched for Zagreb-based teams.": {
    PL: "Uruchomiono zaktualizowane pakiety wellness dla zespołów w Zagrzebiu.",
    HR: "Pokrenuti su revidirani paketi wellnessa za zagrebačke timove.",
    DE: "Überarbeitete Wellness-Pakete für die Teams in Zagreb wurden eingeführt.",
    FR: "Des forfaits bien-être révisés ont été lancés pour les équipes basées à Zagreb."
  },
  "DE/EU Integration": { PL: "Integracja DE/UE", HR: "DE/EU integracija", DE: "DE/EU-Integration", FR: "Intégration DE/UE" },
  "Standardizing benefit platforms across the European hubs.": {
    PL: "Standaryzacja platform świadczeń w europejskich centrach.",
    HR: "Standardizacija platformi za beneficije u europskim centrima.",
    DE: "Standardisierung der Zusatzleistungsplattformen in den europäischen Hubs.",
    FR: "Standardisation des plateformes d'avantages sociaux dans les hubs européens."
  },
  "Poland RAG Pipeline": { PL: "Potok RAG w Polsce", HR: "Poljski RAG sustav", DE: "Polen-RAG-Pipeline", FR: "Pipeline RAG pour la Pologne" },
  "Deploying local language fine-tuned models at Warsaw Spire.": {
    PL: "Wdrażanie modeli dostrojonych do języka polskiego w Warsaw Spire.",
    HR: "Implementacija lokalno prilagođenih modela u Warsaw Spireu.",
    DE: "Bereitstellung lokal feingetunter Sprachmodelle im Warsaw Spire.",
    FR: "Déploiement de modèles affinés en langue locale au Warsaw Spire."
  },
  "Warsaw Spire Expansion": { PL: "Rozbudowa Warsaw Spire", HR: "Proširenje u Warsaw Spireu", DE: "Warsaw Spire Erweiterung", FR: "Expansion du Warsaw Spire" },
  "New floor opened to accommodate the growing localized AI team.": {
    PL: "Otwarto nowe piętro, aby pomieścić rosnący, lokalny zespół AI.",
    HR: "Otvoren je novi kat za smještaj rastućeg lokalnog AI tima.",
    DE: "Neue Etage eröffnet, um das wachsende lokale KI-Team unterzubringen.",
    FR: "Nouvel étage ouvert pour accueillir l'équipe d'IA locale en pleine croissance."
  },
  "Medicover Integration": { PL: "Integracja z Medicover", HR: "Medicover integracija", DE: "Medicover-Integration", FR: "Intégration de Medicover" },
  "Upgraded regional healthcare portals are now active.": {
    PL: "Zmodernizowane regionalne portale opieki zdrowotnej są już aktywne.",
    HR: "Nadograđeni regionalni portali zdravstvene zaštite sada su aktivni.",
    DE: "Aktualisierte regionale Gesundheitsportale sind jetzt aktiv.",
    FR: "Les portails de santé régionaux mis à niveau sont désormais actifs."
  },
  "Zagreb Design Lab": { PL: "Zagrzebskie laboratorium projektowe", HR: "Zagrebački dizajn laboratorij", DE: "Zagreb-Design-Lab", FR: "Laboratoire de design de Zagreb" },
  "Generative UI experiments starting at the local Matrix office.": {
    PL: "Rozpoczęcie eksperymentów z generatywnym UI w lokalnym biurze Matrix.",
    HR: "Početak eksperimenata s generativnim sučeljem u lokalnom uredu Matrix.",
    DE: "Start von Experimenten mit generativer Benutzeroberfläche am lokalen Matrix-Standort.",
    FR: "Début des expériences d'UI générative au bureau Matrix local."
  },
  "Wellness Package Booster": { PL: "Zwiększenie pakietu wellness", HR: "Wellness booster paket", DE: "Wellness-Paket-Booster", FR: "Booster de forfait bien-être" },
  "Croatia employee wellness vouchers are ready for distribution.": {
    PL: "Kupony wellness dla pracowników w Chorwacji są gotowe do dystrybucji.",
    HR: "Hrvatski wellness kuponi za zaposlenike spremni su za podjelu.",
    DE: "Wellness-Gutscheine für Mitarbeiter in Kroatien sind bereit für den Versand.",
    FR: "Les bons de bien-être pour les employés en Croatie sont prêts pour la distribution."
  },
  "Lake Jarun Meetup": { PL: "Spotkanie nad jeziorem Jarun", HR: "Lake Jarun Meetup", DE: "Treffen am Jarun-See", FR: "Rencontre au lac Jarun" },
  "Catered midsummer bonding event finalized by regional HR.": {
    PL: "Spotkanie integracyjne z cateringiem sfinalizowane przez regionalny dział HR.",
    HR: "Završeno catering druženje na jezeru u organizaciji regionalnog HR-a.",
    DE: "Catering-Mittsommer-Integrationsevent von der regionalen HR-Abteilung finalisiert.",
    FR: "Événement d'intégration avec traiteur finalisé par les RH régionales."
  },
  "Ethical AI Forum": { PL: "Forum etycznej sztucznej inteligencji", HR: "Forum o etičnoj umjetnoj inteligenciji", DE: "Forum für ethische KI", FR: "Forum de l'IA éthique" },
  "Berlin team leads are hosting an open roundtable on secure LLM proxies.": {
    PL: "Liderzy zespołu z Berlina organizują otwarty okrągły stół na temat bezpiecznych serwerów proxy LLM.",
    HR: "Berlinski voditelji timova organiziraju otvoreni okrugli stol o sigurnim LLM proxyjima.",
    DE: "Die Berliner Teamleiter veranstalten eine offene Diskussionsrunde zu sicheren LLM-Proxys.",
    FR: "Les chefs d'équipe de Berlin organisent une table ronde ouverte sur les proxys LLM sécurisés."
  },
  "GDPR Compliance Guard": { PL: "Strażnik zgodności z RODO", HR: "Čuvar GDPR usklađenosti", DE: "DSGVO-Compliance-Guard", FR: "Gardien de la conformité RGPD" },
  "Updated automated audits ensuring no PII leaks to public endpoints.": {
    PL: "Zaktualizowane automatyczne audyty zapewniające brak wycieków danych osobowych do publicznych punktów końcowych.",
    HR: "Ažurirane automatizirane revizije osiguravaju da nema curenja osobnih podataka.",
    DE: "Aktualisierte automatisierte Audits stellen sicher, dass keine personenbezogenen Daten an öffentliche Endpunkte gelangen.",
    FR: "Audits automatisés mis à jour garantissant l'absence de fuite de données personnelles vers des terminaux publics."
  },
  "German Language Packs": { PL: "Niemieckie pakiety językowe", HR: "Njemački jezični paketi", DE: "Deutsche Sprachpakete", FR: "Packs de langue allemande" },
  "Successfully integrated high-performance German translation corpus.": {
    PL: "Pomyślnie zintegrowano wydajny korpus tłumaczeń na język niemiecki.",
    HR: "Uspješno integriran korpus njemačkih prijevoda visoke učinkovitosti.",
    DE: "Leistungsstarkes deutsches Übersetzungs-Korpus erfolgreich integriert.",
    FR: "Intégration réussie du corpus de traduction allemande haute performance."
  },
  "AI Agents Pipeline": { PL: "Potok agentów AI", HR: "AI agentorski sustavi", DE: "KI-Agenten-Pipeline", FR: "Pipeline d'agents d'IA" },
  "Silicon Valley lab is testing stateful agentic delegation models.": {
    PL: "Laboratorium w Dolinie Krzemowej testuje stanowe modele delegowania zadań agentom.",
    HR: "Laboratorij u Silicijskoj dolini testira složene modele delegiranja zadataka agentima.",
    DE: "Das Labor im Silicon Valley testet zustandsabhängige KI-Delegationsmodelle.",
    FR: "Le laboratoire de la Silicon Valley teste des modèles de délégation d'agents avec état."
  },
  "Wellness and Q&A Match": { PL: "Wellness i sesja Q&A", HR: "Wellness i Q&A usklađivanje", DE: "Wellness & Q&A Abstimmung", FR: "Bien-être et questions-réponses" },
  "Upcoming virtual Q&A on 401k structure changes and wellness incentives.": {
    PL: "Nadchodząca wirtualna sesja pytań i odpowiedzi na temat zmian w strukturze 401k i zachęt wellness.",
    HR: "Nadolazeći virtualni Q&A o promjenama strukture 401k i wellness poticajima.",
    DE: "Bevorstehende virtuelle Fragerunde zu Änderungen am 401k-Plan und Wellness-Incentives.",
    FR: "Séance virtuelle de questions-réponses à venir sur les changements de structure du 401k et les primes de bien-être."
  },
  "Cloud Integration": { PL: "Integracja z chmurą", HR: "Integracija s oblakom", DE: "Cloud-Integration", FR: "Intégration du cloud" },
  "Migrating enterprise pipelines to fully secure low-latency APIs.": {
    PL: "Migracja korporacyjnych potoków do w pełni bezpiecznych interfejsów API o niskich opóźnieniach.",
    HR: "Migracija korporacijskih sustava na potpuno sigurne API-je s malim kašnjenjem.",
    DE: "Migration von Unternehmens-Pipelines auf vollständig sichere APIs mit geringer Latenz.",
    FR: "Migration des pipelines d'entreprise vers des API entièrement sécurisées à faible latence."
  },
  "Bilingual NLP Model": { PL: "Dwujęzyczny model NLP", HR: "Dvojezični NLP model", DE: "Bilinguales NLP-Modell", FR: "Modèle NLP bilingue" },
  "Developing dual-language semantic parsing models for CA employees.": {
    PL: "Opracowywanie dwujęzycznych modeli parsowania semantycznego dla pracowników w Kanadzie.",
    HR: "Razvoj dvojezičnih modela semantičkog parsiranja za zaposlenike u Kanadi.",
    DE: "Entwicklung zweisprachiger semantischer Parsing-Modelle für kanadische Mitarbeiter.",
    FR: "Développement de modèles d'analyse sémantique bilingues pour les employés canadiens."
  },
  "Toronto Node Live": { PL: "Węzeł w Toronto aktywny", HR: "Toronto čvor aktivan", DE: "Toronto Node Live", FR: "Nœud de Toronto en ligne" },
  "Onboarding local specialists to lead remote bilingual training modules.": {
    PL: "Wdrażanie lokalnych specjalistów do prowadzenia zdalnych dwujęzycznych modułów szkoleniowych.",
    HR: "Uvođenje lokalnih stručnjaka za vođenje udaljenih dvojezičnih modula obuke.",
    DE: "Einarbeitung lokaler Spezialisten für die Leitung zweisprachiger Remote-Schulungsmodule.",
    FR: "Intégration de spécialistes locaux pour diriger des modules de formation bilingues à distance."
  },
  "Canadian Tax Updates": { PL: "Aktualizacje podatkowe w Kanadzie", HR: "Kanadske porezne vijesti", DE: "Kanadische Steuer-Updates", FR: "Mises à jour fiscales canadiennes" },
  "Coordinating tax-nexus allocations with the global HR team.": {
    PL: "Koordynowanie alokacji podatkowej z globalnym zespołem HR.",
    HR: "Koordinacija poreznih alokacija s globalnim HR timom.",
    DE: "Abstimmung der steuerlichen Betriebsstätten-Allokationen mit dem globalen HR-Team.",
    FR: "Coordination des allocations de liens fiscaux avec l'équipe RH mondiale."
  },
  "Global AI Vision 2026": { PL: "Globalna wizja AI 2026", HR: "Globalna AI vizija 2026", DE: "Globale KI-Vision 2026", FR: "Vision mondiale de l'IA 2026" },
  "CEO presentation of the full-stack autonomous coding assistant roadmap.": {
    PL: "Prezentacja CEO na temat harmonogramu rozwoju autonomicznych asystentów kodowania.",
    HR: "Prezentacija izvršnog direktora o planu razvoja autonomnih asistenata za kodiranje.",
    DE: "Präsentation des CEO zur Roadmap für autonome Codierungsassistenten.",
    FR: "Présentation du PDG sur la feuille de route des assistants de codage autonomes."
  },
  "Unified Benefit Desk": { PL: "Jednolity panel świadczeń", HR: "Jedinstveni desk za beneficije", DE: "Einheitlicher Benefit-Desk", FR: "Guichet unique d'avantages sociaux" },
  "Standardized platform consolidation across all Europe and American offices.": {
    PL: "Konsolidacja standaryzowanej platformy we wszystkich biurach w Europie i Ameryce.",
    HR: "Konsolidacija standardizirane platforme u svim europskim i američkim uredima.",
    DE: "Konsolidierung standardisierter Plattformen über alle europäischen und amerikanischen Standorte.",
    FR: "Consolidation d'une plateforme standardisée dans tous les bureaux européens et américains."
  },
  "Secure VPN Topologies": { PL: "Bezpieczne topologie VPN", HR: "Sigurne VPN topologije", DE: "Sichere VPN-Topologien", FR: "Topologies VPN sécurisées" },
  "Critical guidelines for secure database retrieval and VPN networking.": {
    PL: "Kluczowe wytyczne dotyczące bezpiecznego pobierania danych z baz danych i sieci VPN.",
    HR: "Ključne smjernice za sigurno pretraživanje baze podataka i VPN umrežavanje.",
    DE: "Wichtige Richtlinien für den sicheren Datenbank-Abruf und VPN-Vernetzung.",
    FR: "Directives cruciales pour la récupération sécurisée de bases de données et la mise en réseau VPN."
  }
};

function deepTranslate(data: any, targetLanguage: string): any {
  if (targetLanguage === 'EN' || !targetLanguage) return data;
  
  if (typeof data === 'string') {
    const trimmed = data.trim();
    if (TRANSLATION_MAP[trimmed] && TRANSLATION_MAP[trimmed][targetLanguage]) {
      return TRANSLATION_MAP[trimmed][targetLanguage];
    }
    return data;
  }
  
  if (Array.isArray(data)) {
    return data.map(item => deepTranslate(item, targetLanguage));
  }
  
  if (data !== null && typeof data === 'object') {
    const copy: any = {};
    for (const key of Object.keys(data)) {
      // Don't translate metadata keys like "id", "region", "status", "category", "type", "date", "assignee", etc.
      if (['id', 'region', 'status', 'category', 'type', 'date', 'assignee', 'week', 'timezone', 'location'].includes(key)) {
        copy[key] = data[key];
      } else {
        copy[key] = deepTranslate(data[key], targetLanguage);
      }
    }
    return copy;
  }
  
  return data;
}

async function translateWithGemini(data: any, targetLanguage: string, contextDescription: string): Promise<any> {
  if (!targetLanguage || targetLanguage === 'EN') return data;
  
  // 1. Try deepTranslate first for near-instant 0-api lookup
  try {
    const dictTranslated = deepTranslate(data, targetLanguage);
    if (dictTranslated) {
      return dictTranslated;
    }
  } catch (error) {
    console.warn("Dictionary lookup failed, falling back to original or Gemini:", error);
  }

  // 2. Fall back to cached translation if available
  const cacheKey = `${contextDescription}_${targetLanguage}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }
  
  try {
    const prompt = `
      You are an expert translator on a corporate intranet dashboard.
      Translate the following JSON data of "${contextDescription}" into "${targetLanguage}".
      
      CRITICAL TRANSLATION RULES:
      - Translate all human-readable, user-facing titles, names, descriptions, and content texts into the target language "${targetLanguage}" (PL is Polish, HR is Croatian, DE is German, FR is French, EN is English).
      - Do NOT translate technical identifiers, ID values, assignee names, categories, tags, types, region codes, dates, statuses, email addresses, timezones, ping rates, colors, codes, weeks, or numeric statistics. E.g. keep "PL", "HR", "DE", "US", "CA", "Global" as keys/values in fields like "region", "code", "id", and do not change "id": "p1".
      - Keep emojis, layout tags, or symbols as they are.
      - Return ONLY the exact translated JSON structure. Do NOT wrap it in \`\`\`json markdown blocks or return auxiliary notes. Your response must be purely raw parsing-ready JSON.
      
      JSON DATA:
      ${JSON.stringify(data)}
    `;
    
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });
    
    let text = response.text || "";
    if (text.includes("```")) {
      const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (match) {
        text = match[1];
      }
    }
    text = text.trim();
    
    const translatedData = JSON.parse(text);
    translationCache.set(cacheKey, translatedData);
    return translatedData;
  } catch (err) {
    // Graceful silent fallback to original data to prevent traceback clutter in logs
    return data;
  }
}

// API Routes
app.get("/api/feed", async (req, res) => {
  try {
    const language = req.query.language as string || "EN";
    const translated = await translateWithGemini(ORG_FEED, language, "organizational_feed");
    res.json(translated);
  } catch (err) {
    res.json(ORG_FEED);
  }
});

app.get("/api/knowledge", async (req, res) => {
  try {
    const language = req.query.language as string || "EN";
    const translated = await translateWithGemini(KNOWLEDGE_BASE, language, "knowledge_base");
    res.json(translated);
  } catch (err) {
    res.json(KNOWLEDGE_BASE);
  }
});

const FALLBACK_SUMMARIES: Record<string, Record<string, string>> = {
  p1: {
    EN: `* **Standard Accrual**: Vacation days and PTO accumulation vary dynamically based on seniority, role, and local labor legislation.
* **Regional Rules**: For example, in Poland it is 20-26 days, in Germany 30 days, in Croatia minimum of 20 business days. Log requests through the Exadel Portal.`,
    PL: `* **Standardowy wymiar**: Naliczenie dni urlopu i czas wolny różnią się dynamicznie w zależności od stażu pracy, roli i lokalnego prawa pracy.
* **Zasady regionalne**: Na przykład w Polsce wynosi 20-26 dni, w Niemczech 30 dni, w Chorwacji minimum 20 dni roboczych. Zgłaszaj wnioski przez Portal Exadel.`,
    HR: `* **Standardno skupljanje**: Slobodni dani i godišnji odmor razlikuju se ovisno o stažu, ulozi i lokalnom radnom zakonodavstvu.
* **Regionalna pravila**: Na primjer, u Hrvatskoj je to minimalno 20 radnih dana, u Poljskoj 20-26 dana, u Njemačkoj 30 dana. Podnesite zahtjeve putem portala Exadel.`,
    DE: `* **Standard-Anspruch**: Urlaubstage und Freistellungen variieren basierend auf Betriebszugehörigkeit, Rolle und lokalen Arbeitsgesetzen.
* **Regionale Sonderregelungen**: Beispielsweise in Deutschland 30 Tage, in Polen 20-26 Tage, in Kroatien mindestens 20 Arbeitstage. Beantragen Sie über das Exadel Portal.`,
    FR: `* **Cumul Standard**: L'acquisition de congés payés varie selon l'ancienneté, le poste et la législation du travail nationale.
* **Règles Régionales**: En France, 25 jours RTT + 5 semaines de congés payés. Utilisez l'outil Exadel pour soumettre vos demandes.`
  },
  p2: {
    EN: `* **Submission Window**: Receipts are strictly required for any expenses exceeding $10, and must be filed within 30 days via internal tools.
* **Regional Compliance**: Allowances align with national per-diem rates (e.g., 45 PLN in Poland, 26.54 EUR in Croatia, or standard IRS GSA rates in the US).`,
    PL: `* **Terminy rozliczeń**: Rachunki są bezwzględnie wymagane dla wydatków powyżej 10 USD i muszą być złożone w ciągu 30 dni przez wewnętrzne narzędzia.
* **Zgodność regionalna**: Diety są zgodne z krajowymi stawkami (np. 45 PLN w Polsce, 26,54 EUR w Chorwacji, lub stawki IRS GSA w USA).`,
    HR: `* **Rok za prijavu**: Računi su obvezni za sve troškove veće od 10 USD, a moraju se podnijeti u roku od 30 dana putem internih alata.
* **Regionalna usklađenost**: Naknade su usklađene s nacionalnim dnevnicama (npr. 26.54 EUR u Hrvatskoj, 45 PLN u Poljskoj ili IRS GSA stope u SAD-u).`,
    DE: `* **Einreichungsfrist**: Belege ab 10 USD sind zwingend erforderlich und müssen innerhalb von 30 Tagen über interne Tools eingereicht werden.
* **Regionale Erstattungen**: Sätze orientieren sich an nationalen Pauschalen (z. B. Verpflegungsmehraufwand in DE, 26,54 EUR in HR, 45 PLN in PL).`,
    FR: `* **Frais & Délais**: Les justificatifs sont obligatoires pour tout montant supérieur à 10 $, et doivent être soumis sous 30 jours via nos outils.
* **Spécificités Locales**: Remboursement selon les barèmes officiels (ex. indemnités URSSAF en France, taux de kilométrage GSA américain).`
  },
  p3: {
    EN: `* **Integrated Providers**: Health, insurance, and medical network coordination is structured with regional supplemental providers to support employees locally.
* **Regional Benefits**: Features private packages such as Medicover + MultiSport in Poland, supplemental HZZO in Croatia, or Blue Cross plans in the US.`,
    PL: `* **Zintegrowany dostawca**: Koordynacja opieki zdrowotnej i ubezpieczeń jest zorganizowana z regionalnymi dostawcami prywatnymi.
* **Świadczenia regionalne**: Obejmuje pakiety prywatne, takie jak Medicover + MultiSport w Polsce, ubezpieczenie HZZO w Chorwacji lub plany Blue Cross w USA.`,
    HR: `* **Integrirani pružatelji**: Koordinacija zdravstvenog osiguranja osmišljena je s regionalnim pružateljima usluga kako bi se podržao lokalni tim.
* **Regionalne beneficije**: Uključuje privatne pakete kao što su dopunsko HZZO osiguranje u Hrvatskoj, Medicover + MultiSport w Poljskoj ili Blue Cross u SAD-u.`,
    DE: `* **Integrierte Partner**: Die Abstimmung der Krankenversicherung erfolgt über regionale Partner, um Mitarbeiter vor Ort optimal zu unterstützen.
* **Regionale Zusatzleistungen**: Gesetzliche Kofinanzierung oder private Extras in DE, Medicover + MultiSport w Polen, HZZO-Zusatztarif in Kroatien.`,
    FR: `* **Réseau de Santé**: La complémentaire santé et la prévoyance sont structurées avec des partenaires agréés pour une couverture locale forte.
* **Avantages Régionaux**: Mutuelle d'entreprise + Tickets Restaurant en France, ou régime d'épargne-retraite REER collectif au Canada.`
  },
  p4: {
    EN: `* **Onboarding Schedule**: Guidelines provide specific workflows on Day 1 (hardware), Day 7 (security training), and Day 30 (performance check-in).
* **Office Integration**: Regional practices apply, such as badge collection at Warsaw Spire Reception (PL) or team lunches in the Zagreb Matrix (HR) and Tbilisi.`,
    PL: `* **Harmonogram wdrożenia**: Wytyczne określają zadania na Dzień 1 (sprzęt), Dzień 7 (szkolenie z bezpieczeństwa) i Dzień 30 (podsumowanie wyników).
* **Integracja z biurem**: Obowiązują regionalne praktyki, np. odbiór identyfikatora w recepcji Warsaw Spire lub wspólny obiad w Zagreb Matrix.`,
    HR: `* **Raspored onboardinga**: Smjernice pružaju specifične zadatke za 1. dan (hardver), 7. dan (sigurnosni trening) i 30. dan (razgovor o učinku).
* **Uredska integracija**: Primjenjuju se lokalne prakse, poput preuzimanja akreditacije u Warsaw Spireu (PL) ili zajedničkog ručka u zagrebačkom Matrixu (HR).`,
    DE: `* **Onboarding-Ablauf**: Der Leitfaden bietet feste Aufgaben für Tag 1 (Hardware einrichten), Tag 7 (Sicherheitstraining) und Tag 30 (Feedback-Gespräch).
* **Standort-Integration**: Regionale Routinen wie virtueller Setup-Start um 9 Uhr in Berlin oder Ausweisabholung im Warsaw Spire in Polen.`,
    FR: `* **Parcours d'Intégration**: Jalons clés de bienvenue au Jour 1 (matériel), Jour 7 (formations de sécurité), et Jour 30 (premier point managérial).
* **Accueil Physique**: Organisation de petits-déjeuners d'accueil à Paris ou récupération des accès au guichet d'accueil de Varsovie.`
  },
  p5: {
    EN: `* **Corporate Agents**: Standard security compliance requires background orchestration agents (OKTA, CrowdStrike) on modern company workstations.
* **Secure Topologies**: Connecting with regional VPN nodes (such as PL-Spire in Poland, HR-Zagreb in Croatia, or DE-Berlin in Germany) is mandatory.`,
    PL: `* **Agenty firmowe**: Standardy bezpieczeństwa wymagają działania agentów zabezpieczających (OKTA, CrowdStrike) na firmowych stacjach roboczych.
* **Bezpieczne sieci**: Połączenie z regionalnymi węzłami VPN (takimi jak PL-Spire w Polsce, HR-Zagreb w Chorwacji lub DE-Berlin w Niemczech) jest obowiązkowe.`,
    HR: `* **Korporativni programi**: Standardna sigurnosna sukladnost zahtijeva instalirane pozadinske programe (OKTA, CrowdStrike) na radnim stanicama.
* **Sigurne mreže**: Obvezno je spajanje na lokalne VPN čvorove (kao što su HR-Zagreb u Hrvatskoj, PL-Spire u Poljskoj ili DE-Berlin u Njemačkoj).`,
    DE: `* **Sicherheits-Software**: Die Einhaltung der IT-Richtlinien erfordert aktive Sicherheits-Tools (OKTA, CrowdStrike) auf allen Arbeitsplatzrechnern.
* **Sichere VPN-Knoten**: Verbindungen müssen zwingend über regionale VPN-Knoten herstellt werden (z. B. DE-Berlin in Deutschland, PL-Spire in Polen).`,
    FR: `* **Logiciels Requis**: La conformité IT impose le déploiement d'agents de sécurité (OKTA, CrowdStrike) sur l'ensemble des postes de travail.
* **Passerelles VPN**: Connexion obligatoire via les nœuds VPN régionaux sécurisés (ex. FR-Paris en France, CA-Toronto au Canada, ou PL-Spire en Pologne).`
  },
  p6: {
    EN: `* **Digital Nomad Limits**: Employees are permitted to check in and work remotely from approved secure jurisdictions for up to 30 calendar days per year.
* **Residency Check**: Structural compliance requires submitting a Nomad Request to satisfy tax liabilities and regional labor laws.`,
    PL: `* **Limity cyfrowych nomadów**: Pracownicy mogą pracować zdalnie z zatwierdzonych bezpiecznych krajów do 30 dni kalendarzowych w roku.
* **Weryfikacja rezydentury**: Zgodność strukturalna wymaga złożenia wniosku Nomad w celu dopełnienia obowiązków podatkowych i ubezpieczeniowych (np. certyfikat A1).`,
    HR: `* **Ograničenja digitalnih nomada**: Zaposlenicima je dopušten rad na daljinu iz odobrenih visokosigurnih zemalja do 30 kalendarskih dana godišnje.
* **Porezna usklađenost**: Potrebno je podnijeti zahtjev 'Nomad' kako bi se osigurala pravna i porezna usklađenost te izbjeglo dvostruko oporezivanje.`,
    DE: `* **Mobiles Arbeiten im Ausland**: Mitarbeiter dürfen bis zu 30 Kalendertage pro Jahr aus freigegebenen Ländern mit hohem Vertrauensstatus remote arbeiten.
* **Steuerkonformität**: Erfordert die Einreichung eines Nomad-Antrags im Voraus unter Berücksichtigung von Wohnsitzregeln und DSGVO-Dienstleistungskontext.`,
    FR: `* **Télétravail International**: Autorisé dans les juridictions de confiance pour un maximum de 30 jours civils par an, sous réserve d'accord managérial.
* **Régularisation Fiscale**: Exige le dépôt préalable d'une demande "Nomade" pour valider l'absence de création de lien fiscal (visa A1 requis en UE).`
  },
  p7: {
    EN: `* **Flexible Desk Booking**: Flexible hybrid work is standard. Shared desks must be reserved in advance through regional reservation platforms.
* **Interactive Collaborations**: Hub spaces can be scheduled dynamically to organize localized meetups or collaborative whiteboard design sprints.`,
    PL: `* **Rezerwacja biurek**: Elastyczna praca hybrydowa to nasz standard. Współdzielone biurka należy rezerwować z wyprzedzeniem przez platformy rezerwacyjne.
* **Praca zespołowa**: Przestrzenie biurowe można rezerwować dynamicznie na lokalne spotkania lub zespołowe warsztaty sprints projektowe.`,
    HR: `* **Rezervacija stolova**: Fleksibilan hibridni rad je naš standard. Zajednički stolovi moraju se rezervirati unaprijed putem aplikacija (npr. MatrixDesk).
* **Interaktivna suradnja**: Uredski prostori mogu se rezervirati za timske sastanke, radionice i dizajnerske sprinteve.`,
    DE: `* **Arbeitsplatz-Buchung**: Flexibles hybrides Arbeiten ist Standard. Gemeinsame Schreibtische müssen im Voraus über Buchungsplattformen reserviert werden.
* **Gemeinsame Sprints**: Kooperatives Arbeiten an Hubs kann flexibel für Team-Workshops oder Design-Sprints geplant und gebucht werden.`,
    FR: `* **Réservation de Bureau**: Le travail hybride flexible est la norme. Les bureaux partagés doivent être réservés à l'avance sur l'application dédiée (ex. MatrixDesk).
* **Salles d'Échange**: Les espaces de réunion des hubs régionaux peuvent être réservés pour des ateliers physiques ou des sessions de conception collaborative.`
  }
};

app.post("/api/summarize", async (req, res) => {
  const { articleId, region = "PL", language = "EN" } = req.body;
  
  // Find the base policy details
  const article = KNOWLEDGE_BASE.find(k => k.id === articleId);
  if (!article) {
    return res.status(404).json({ error: "Article not found" });
  }

  const content = article.content;
  const regionalText = article.regions?.[region] || "";
  
  try {
    const prompt = `You are a professional geo-aware intranet document micro-assistant.
    Summarize the following policy ("${article.title}") in 2 highly punchy and relevant bullet points, specifically considering the regional rules or regional addendum for the region "${region}".
    The summary response MUST be fully translated and written in the user selected language "${language}". If language is "PL", write in custom natural Polish; "HR", write in Croatian; "DE", write in German; "FR", write in French; else write in English.
    
    POLICY CONTENT:
    ${content}
    
    REGIONAL ACCORD/ADDENDUM FOR "${region}":
    ${regionalText}
    
    Do not add extra preambles. Output exactly 2 bullet points in markdown format.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });

    return res.json({ summary: response.text.trim() });
  } catch (error) {
    console.error(`Gemini summarization failed for ${articleId}, utilizing pre-translated high-quality fallback:`, error);
    
    // Choose appropriate fallback language translation bucket
    const langKey = ["PL", "HR", "DE", "FR", "EN"].includes(language) ? language : "EN";
    const articleFallbacks = FALLBACK_SUMMARIES[articleId] || FALLBACK_SUMMARIES["p5"];
    let finalSummary = articleFallbacks[langKey] || articleFallbacks["EN"];

    // Dynamically insert local context indicators in standard EN text if missing in specific translations
    if (langKey === "EN" && regionalText) {
      finalSummary = finalSummary.replace(/\$\{addendum\}/g, regionalText).replace(/\$\{region\}/g, region);
    } else {
      // In case there is dynamic variables left
      finalSummary = finalSummary.replace(/\$\{addendum\}/g, regionalText).replace(/\$\{region\}/g, region);
    }

    return res.json({ summary: finalSummary });
  }
});

app.get("/api/faqs", async (req, res) => {
  try {
    const language = req.query.language as string || "EN";
    const translated = await translateWithGemini(FAQS, language, "faqs");
    res.json(translated);
  } catch (err) {
    res.json(FAQS);
  }
});

app.get("/api/tickets", async (req, res) => {
  try {
    const language = req.query.language as string || "EN";
    const translated = await translateWithGemini(TICKETS, language, "tickets");
    res.json(translated);
  } catch (err) {
    res.json(TICKETS);
  }
});

app.get("/api/ai-hub", async (req, res) => {
  try {
    const language = req.query.language as string || "EN";
    const translated = await translateWithGemini(AI_INITIATIVES, language, "ai_initiatives");
    res.json(translated);
  } catch (err) {
    res.json(AI_INITIATIVES);
  }
});

app.get("/api/ai-digest", async (req, res) => {
  try {
    const region = req.query.region as string || "Global";
    const language = req.query.language as string || "EN";
    
    let personalizedAction = "Select your region in the dashboard to see your personalized feed.";
    let dynamicImpact = "Global Expansion";
    let dynamicSummaries = [
      { title: "Warsaw Spire Office", body: "Our new Poland HQ is now fully operational." },
      { title: "Croatia Benefits", body: "Revised wellness packages launched for Zagreb-based teams." },
      { title: "DE/EU Integration", body: "Standardizing benefit platforms across the European hubs." }
    ];

    if (region === 'PL') {
      personalizedAction = "Your PL feed is active. Join the Warsaw Spire AI Prompt-thon on June 18!";
      dynamicImpact = "Eastern Europe Growth";
      dynamicSummaries = [
        { title: "Poland RAG Pipeline", body: "Deploying local language fine-tuned models at Warsaw Spire." },
        { title: "Warsaw Spire Expansion", body: "New floor opened to accommodate the growing localized AI team." },
        { title: "Medicover Integration", body: "Upgraded regional healthcare portals are now active." }
      ];
    } else if (region === 'HR') {
      personalizedAction = "Your HR feed is active. Join the Zagreb Midsummer BBQ at Lake Jarun on June 20!";
      dynamicImpact = "Adria Regional Focus";
      dynamicSummaries = [
        { title: "Zagreb Design Lab", body: "Generative UI experiments starting at the local Matrix office." },
        { title: "Wellness Package Booster", body: "Croatia employee wellness vouchers are ready for distribution." },
        { title: "Lake Jarun Meetup", body: "Catered midsummer bonding event finalized by regional HR." }
      ];
    } else if (region === 'DE') {
      personalizedAction = "Your DE feed is active. Register for the Berlin AI Ethics & GDPR Sync on June 25!";
      dynamicImpact = "West Europe Compliance";
      dynamicSummaries = [
        { title: "Ethical AI Forum", body: "Berlin team leads are hosting an open roundtable on secure LLM proxies." },
        { title: "GDPR Compliance Guard", body: "Updated automated audits ensuring no PII leaks to public endpoints." },
        { title: "German Language Packs", body: "Successfully integrated high-performance German translation corpus." }
      ];
    } else if (region === 'US') {
      personalizedAction = "Your US feed is active. Attend the Silicon Valley AI Agents Roundtable on June 29!";
      dynamicImpact = "North America Scale";
      dynamicSummaries = [
        { title: "AI Agents Pipeline", body: "Silicon Valley lab is testing stateful agentic delegation models." },
        { title: "Wellness and Q&A Match", body: "Upcoming virtual Q&A on 401k structure changes and wellness incentives." },
        { title: "Cloud Integration", body: "Migrating enterprise pipelines to fully secure low-latency APIs." }
      ];
    } else if (region === 'CA') {
      personalizedAction = "Your CA feed is active. Participate in the Toronto Bilingual NLP Panels on July 2!";
      dynamicImpact = "Bilingual Tech Advances";
      dynamicSummaries = [
        { title: "Bilingual NLP Model", body: "Developing dual-language semantic parsing models for CA employees." },
        { title: "Toronto Node Live", body: "Onboarding local specialists to lead remote bilingual training modules." },
        { title: "Canadian Tax Updates", body: "Coordinating tax-nexus allocations with the global HR team." }
      ];
    } else {
      personalizedAction = "Global feed is active. Join us at the Global AI Summit on July 5!";
      dynamicImpact = "Universal Alignment";
      dynamicSummaries = [
        { title: "Global AI Vision 2026", body: "CEO presentation of the full-stack autonomous coding assistant roadmap." },
        { title: "Unified Benefit Desk", body: "Standardized platform consolidation across all Europe and American offices." },
        { title: "Secure VPN Topologies", body: "Critical guidelines for secure database retrieval and VPN networking." }
      ];
    }

    const rawDigest = {
      week: "June 1-7, 2026",
      impact: dynamicImpact,
      summaries: dynamicSummaries,
      action: personalizedAction
    };

    const translated = await translateWithGemini(rawDigest, language, `ai-digest_${region}`);
    res.json(translated);
  } catch (err) {
    res.json({
      week: "June 1-7, 2026",
      impact: "Global Expansion",
      summaries: [],
      action: "Select your region in the dashboard to see your personalized feed."
    });
  }
});

app.get("/api/employees", async (req, res) => {
  try {
    const language = req.query.language as string || "EN";
    const translated = await translateWithGemini(EMPLOYEES, language, "employees");
    res.json(translated);
  } catch (err) {
    res.json(EMPLOYEES);
  }
});

app.get("/api/meetings", async (req, res) => {
  try {
    const language = req.query.language as string || "EN";
    const translated = await translateWithGemini(MEETINGS, language, "meetings");
    res.json(translated);
  } catch (err) {
    res.json(MEETINGS);
  }
});

app.post("/api/search", async (req, res) => {
  const { query, region = "Global" } = req.body;
  try {
    const prompt = `
      User Query: "${query}"
      User Region: "${region}"
      Knowledge Base: ${JSON.stringify(KNOWLEDGE_BASE)}
      
      Identify the top 2 most relevant policy IDs from the knowledge base for this query. 
      Consider the user's region if specified.
      Return ONLY a JSON array of IDs like ["p1", "p2"]. If none match well, return [].
    `;
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });
    
    // Clean potential markdown from response
    const text = (response.text || "").replace(/```json|```/g, '').trim();
    const ids = JSON.parse(text);
    const results = KNOWLEDGE_BASE.filter(kb => ids.includes(kb.id));
    res.json(results);
  } catch (error) {
    console.error("Search Error fallback:", error);
    // Synthetic fallback for search
    const query = req.body.query?.toLowerCase() || "";
    const results = KNOWLEDGE_BASE.filter(kb => 
      kb.tags.some(tag => query.includes(tag.toLowerCase())) ||
      kb.title.toLowerCase().includes(query)
    ).slice(0, 2);
    res.json(results);
  }
});

app.post("/api/suggest", async (req, res) => {
  const { input, region = "Global" } = req.body;
  if (!input || input.length < 3) return res.json([]);
  
  try {
    const prompt = `
      Current input: "${input}"
      Company Topics: Region-specific PTO, Local Benefits, Warsaw Hub, UA Resilience, North America Tax.
      
      Suggest 3 natural language queries an employee might be typing related to this input.
      Return ONLY a JSON array of strings.
    `;
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });
    const text = (response.text || "").replace(/```json|```/g, '').trim();
    res.json(JSON.parse(text));
  } catch (err) {
    const suggestions: Record<string, string[]> = {
      PL: ["Warsaw Office expansion", "Polish Tax Addenda", "PTO rules for Poland"],
      UA: ["Home office resilience grant", "Kyiv hub status", "Military leave policy"],
      US: ["Health insurance enrollment", "401k matching sync", "FTO guidelines"],
      CA: ["SunLife benefits login", "Toronto office social", "RRSP matching"]
    };
    res.json(suggestions[region as string] || ["PTO Policy", "Expense claims", "IT ticket status"]);
  }
});

app.post("/api/chat", async (req, res) => {
  const { messages, region = "PL", language = "EN" } = req.body;
  
  try {
    const lastMessage = messages[messages.length - 1].content;
    const lowerMessage = lastMessage.toLowerCase();
    
    // Core FAQs Interception with dynamic citation & local context
    if (lowerMessage.includes("vacation") || lowerMessage.includes("pto days") || lowerMessage.includes("ile mam urlopu") || lowerMessage.includes("urlop") || lowerMessage.includes("godišnj") || lowerMessage.includes("urlaub") || lowerMessage.includes("congé") || lowerMessage.includes("holidays") || lowerMessage.includes("holiday") || lowerMessage.includes("święta") || lowerMessage.includes("swieta")) {
      if (region === "PL") {
        return res.json({
          content: `### 🌴 Vacation & Time Off Policy — Poland (PL) [p1]
In Poland, vacation days (Urlop wypoczynkowy) are determined by statutory minimums based on your overall career tenure (including higher education tenure credit):
- **Tenure < 10 years**: **20 business days** per calendar year.
- **Tenure >= 10 years**: **26 business days** per calendar year.

*Statutory Tenures & Education Credit*: 
Exadel credit systems grant **8 years of tenure credit** automatically for university graduates (Licencjat/Magister holders) and **5 years** for technical high school graduates.

**Bridge/Wellness Days**: Exadel Poland provides 2 additional fully paid corporate wellness bridge days per year.
**Workday Link**: To check your real-time accrued balance or request time off, visit [Workday (Time Off module)](https://workday.exadel.com).`
        });
      } else if (region === "UA") {
        return res.json({
          content: `### 🇺🇦 Vacation & Local Holidays Policy — Ukraine (UA) [p1]
- **Statutory Vacation**: Ukraine-based team members accrue **24 calendar days** of paid annual leave per year.
- **Local Ukrainian Holidays**: Exadel observes 11 statutory national holidays in Ukraine including Independence Day (August 24), Constitution Day (June 28), and Ukrainian Defenders Day (October 1). 
- *Note on Martial Law*: Under prevailing martial law conditions, statutory weekday holiday observances are currently treated as standard working days with standard pay. 
- **Time Off Booking**: All leave requests must be logged through the **Workday Time Off** catalog. For any emergencies, contact regional resilience manager **Mariia Shevchenko** (hr.ua@exadel.com).`
        });
      } else if (region === "US") {
        return res.json({
          content: `### 🇺🇸 Paid Time Off & FTO Policy — United States (US) [p1]
For salaried, full-time remote and hybrid employees based in the United States, Exadel offers **Unlimited Flexible Time Off (FTO)**.
- There is no hard cap or ticking accrual limit.
- You must coordinate with your direct delivery manager to ensure client and task coverage remains seamless.
- Hourly paid personnel accrue standard PTO hourly (accruing up to 15 days annually).

**Workday Link**: Access [Workday (Time Off module)](https://workday.exadel.com) to log your planned FTO.`
        });
      } else if (region === "CA") {
        return res.json({
          content: `### 🇨🇦 Vacation & Provincial Time Off — Canada (CA) [p1]
In Canada, vacation entitlement corresponds to both corporate policy and provincial employment standards:
- **Provincial Minimums**: **15 business days** of paid annual vacation (escalating to **20 business days** after 5 consecutive years of employment in states like Ontario or BC).
- **Statutory Holidays**: Canadian personnel receive 10 statutory paid holidays, including Canada Day (July 1st) and Thanksgiving (Second Monday in October).
- **RRSP Matching**: Exadel Canada offers a Registered Retirement Savings Plan (RRSP) matching benefit where corporate matches up to **4%** of your annual base salary.
- **Workday Link**: Request your upcoming time off on [Workday](https://workday.exadel.com).`
        });
      } else {
        const found = KNOWLEDGE_BASE.find(k => k.id === 'p1');
        const addendum = found?.regions?.[region as keyof typeof found.regions] || "20 days standard minimum.";
        return res.json({
          content: `### 🌴 Paid Time Off Policy — Region ${region} [p1]
${addendum}

Please consult your country manager or local HR Coordinator for custom contract addendums. 

**Workday Link**: Log your plan in [Workday](https://workday.exadel.com).`
        });
      }
    }
    
    if (lowerMessage.includes("how do i request") || lowerMessage.includes("apply for pto") || lowerMessage.includes("how to request") || lowerMessage.includes("wniosek o urlop") || lowerMessage.includes("jak złoży") || lowerMessage.includes("zglosic urlop")) {
      if (region === "PL") {
        return res.json({
          content: `### 🌴 How to Request Time Off in Poland [p1]
1. Align on leave dates with your project lead at least 2 weeks in advance to secure team backup.
2. Log into your **Workday (Time Off)** module at [https://workday.exadel.com](https://workday.exadel.com).
3. Select 'Request Time Off', choose **Urlop wypoczynkowy**, and specify the dates.
4. For medical/accident related leave (L4), your doctor submits a secure digital ZUS ZLA form; please notify your coordinator **Anna Kowalska** immediately at hr.pl@exadel.com.`
        });
      } else {
        return res.json({
          content: `### 🌴 How to Request Time Off [p1]
1. Submit your planned vacation dates to your immediate supervisor.
2. Enter your time off in [Workday (Time Off Module)](https://workday.exadel.com) to allow resource planners to coordinate availability.
3. Keep your OKTA profile status and company Slack status updated with your out-of-office (OOO) period.`
        });
      }
    }

    if (lowerMessage.includes("hr contact") || lowerMessage.includes("who is my hr") || lowerMessage.includes("lider hr") || lowerMessage.includes("kontakt hr") || lowerMessage.includes("hr lead") || lowerMessage.includes("partner hr")) {
      return res.json({
        content: `### 🫂 Your Regional HR Contacts [p3][f2]
Here are our certified people managers to help support your career and benefits:
- **Poland (PL)**: **Anna Kowalska** (Email: \`hr.pl@exadel.com\`). Office: Floor 8, Warsaw Spire.
- **Ukraine (UA)**: **Mariia Shevchenko** (Email: \`hr.ua@exadel.com\`). Dedicated resilience assistance & hotdesking co-ordinator.
- **Croatia (HR)**: **Marko Horvat** (Email: \`hr.hr@exadel.com\`). Office: Matrix Bldg Zagreb.
- **Germany (DE)**: **Elena Wagner** (Email: \`hr.de@exadel.com\`). Office: Berlin Co-Working Hub.
- **Canada (CA)**: **Sophie Laurent / CA Desk** (Email: \`hr.ca@exadel.com\`). Office: Toronto Flex Desk.
- **Americas & Global**: **Mark Thompson** (Email: \`hr.us@exadel.com\`). Fully remote coordinator.

*Need escalations?* Write securely to \`hr.compliance@exadel.com\`.`
      });
    }

    if (lowerMessage.includes("hotel") || lowerMessage.includes("travel limit") || lowerMessage.includes("reimburse") || lowerMessage.includes("dieta") || lowerMessage.includes("limits") || lowerMessage.includes("expense limit") || lowerMessage.includes("koszt podrozy")) {
      if (region === "PL") {
        return res.json({
          content: `### 💰 Travel & Hotel Expenditure Guidelines — Poland [p2]
For Polish business trips and corporate traveling:
- **Hotel Lodging Cap**: Maximum of **550 PLN per night** for Warsaw; **400 PLN per night** for other locations.
- **Domestic Per Diem (Dieta)**: **45 PLN per day** for full domestic travel.
- **International Per Diems**: Regulated by the statutory Ministry of Finance tables (e.g., **49 EUR per day** for Germany).
- **Invoices**: For all spending exceeding $10 USD equivalent, request a full taxable company invoice ("faktura") under Exadel PL billing coordinates. Submit within 30 days on SAP Concur.`
        });
      } else {
        return res.json({
          content: `### 💰 Travel & Hospitality Limits [p2]
General travel reimbursements adhere to IRS & GSA standards:
- **Hotel Lodging Cap**: **$250 USD per night** standard (excluding taxes), up to **$350 USD** pre-approved for dense metros (NYC, SF).
- **Meal Allowance (Per Diem)**: Follow GSA limits.
- **Private Car Mileage**: Reimbursed at **67 cents per mile**.`
        });
      }
    }

    if (lowerMessage.includes("w-4") || lowerMessage.includes("pit") || lowerMessage.includes("tax doc") || lowerMessage.includes("year-end tax") || lowerMessage.includes("documents tax") || lowerMessage.includes("pit-11") || lowerMessage.includes("w2") || lowerMessage.includes("w-2") || lowerMessage.includes("podatki") || lowerMessage.includes("t4") || lowerMessage.includes("rrsp") || lowerMessage.includes("fop") || lowerMessage.includes("tax")) {
      if (region === "PL") {
        return res.json({
          content: `### 📂 Year-End Polish Tax Filing (PIT-11)
- **PIT-11 Statements**: Auto-generated by our Warsaw payroll desk and uploaded no later than **February 28** for the previous calendar year.
- **Access**: Securely download from your [Workday Documents Hub](https://workday.exadel.com).
- **Submission**: Use 'Twój e-PIT' portal to audit and finalize your PIT-37 forms.
- *Contact*: Questions or corrections go to tax specialist Sarah Miller at \`finance.pl@exadel.com\`.`
        });
      } else if (region === "UA") {
        return res.json({
          content: `### 📂 Private Entrepreneur (PE / FOP Group III) Tax Filing — Ukraine
- **Tax Declarations**: For Ukraine personnel operating as Private Entrepreneurs (FOP Grade III), Exadel's local Ukrainian banking partners and accounting desk handles tax reporting.
- **Reporting Period**: Filed quarterly. Corporate tax team automatically calculates the **5% unified tax** and single social contribution (ESV).
- **Invoices & Acts**: Digitally sign your monthly Act of Acceptance in the corporate **Document Space** by the 5th of each month.
- *Finance Desk Support*: Direct queries to \`finance.ua@exadel.com\`.`
        });
      } else if (region === "CA") {
        return res.json({
          content: `### 🇨🇦 Canadian Year-End Tax Filing & RRSP (T4 Slips)
- **T4 Tax Slips**: Canadian T4 tax slips (Statement of Remuneration Paid) are rendered and delivered digitally by **February 28** annually.
- **RRSP Tax Slips**: Issued alongside your T4 slips. Your personal contributions and corporate **4% matching contributions** are reported under Line 20800 of your Canadian T1 return.
- **How to Download**: Log into ADP Canada or download directly from your **Workday Documents Hub** at [https://workday.exadel.com](https://workday.exadel.com).`
        });
      } else {
        return res.json({
          content: `### 📂 US Tax Documentation (W-2 & W-4 Updates) & Open Enrollment
- **W-2 Statements**: Issued digitally by **January 31st** annually. Available inside W-2 portals in ADP or your Workday Pay & Tax profile.
- **W-4 Withholdings**: You can dynamically update and file your Federal / State withholding variables anytime directly on [Workday](https://workday.exadel.com).
- **Open Enrollment**: The annual healthcare, dental, and vision open enrollment cycle is currently active and closes **in 5 days**. Log into Workday Benefit Election module to choose or update plans.`
        });
      }
    }

    if (lowerMessage.includes("internal job") || lowerMessage.includes("platform engineer") || lowerMessage.includes("careers") || lowerMessage.includes("open job") || lowerMessage.includes("internal vacanc") || lowerMessage.includes("mobility")) {
      return res.json({
        content: `### 💼 Internal Careers & Active Vacancies [j_pl][j_us]
We strongly champion career growth! Here are active internal positions currently recruiting:
1. **Platform Engineer — Infrastructure Operations**
   - **Location**: Poland (PL) — Warsaw Spire hybrid or fully remote Poland.
   - **Stack**: Kubernetes, Terraform, Node.js, Python, AWS pipelines, and secure VPC gateways.
   - **Hiring Contact**: Elena Wagner (Operations)
2. **Senior AI Prompt Engineer**
   - **Location**: Europe (PL / HR) — hybrid Matrix/Spire hubs.
   - **Stack**: Enterprise agent instructions tuning, semantic ingestion architectures, and safety layers.
3. **TypeScript / Full-Stack Engineer**
   - **Location**: Berlin hub or remote DE.
   - **Stack**: React, Node.js, and automated PDF archives.

*To Apply*: Inquire with your supervisor or submit an application within [Workday (Careers Portal)](https://workday.exadel.com).`
      });
    }

    if (lowerMessage.includes("what's happening") || lowerMessage.includes("happening this week") || lowerMessage.includes("org feed") || lowerMessage.includes("events this week") || lowerMessage.includes("what happening") || lowerMessage.includes("digest")) {
      if (region === "PL") {
        return res.json({
          content: `### 📰 Corporate Digest & Local Feed (Region: PL) [e_pl][1]
Curated announcements and milestones for Poland teams:
- **EMEA Pilot Launch**: We have deployed our 'BestFrAIend' digital twins here in Warsaw! Our deep learning pod fine-tuned Llama-3.3 on local HR PDFs, achieving 98.7% safety ratings.
- **Warsaw Spire Relocation**: Exadel Poland is expanding our Warsaw Spire office (Floor 8). Grand opening and onboarding event is scheduled for next month.
- **Tech Talk On-Site**: Warsaw Spire AI Prompting & RAG workshop is running on **June 18th at 3:00 PM CET** inside Room 8.4 'Copernicus'.
- **Internal Job**: **Platform Engineer — Infrastructure Operations** is now hiring in Warsaw!`
        });
      } else {
        return res.json({
          content: `### 📰 Corporate Digest & Local Feed (Region: ${region}) [e_us][3]
Here is your current regional briefing:
- **Benefits Election**: Annual healthcare and HSA selection plans open next week.
- **Town Hall Panel**: Virtual Q&A regarding wellness premium structures is streaming on **June 12 at 2:00 PM EST**.
- **Internal Vacancies**: Open hires for HR Regional Coordinators and remote Platform Engineers are active on ADP.`
        });
      }
    }

    if (lowerMessage.includes("runbook") || lowerMessage.includes("runbooks") || lowerMessage.includes("confluence") || lowerMessage.includes("wiki") || lowerMessage.includes("documentation")) {
      return res.json({
        content: `### 💻 Engineering Runbooks & Confluence Directories [p5]
All engineering wiki hubs are hosted on **Confluence**:
- **Engineering Knowledge Hub**: [https://confluence.exadel.com/display/ENG](https://confluence.exadel.com/display/ENG)
- **IT Credentials & VPN Configurations**: Detailed instructions for setting up your PL-Spire VPN endpoint and OKTA client are located at [https://confluence.exadel.com/display/ITS-PL-Spire](https://confluence.exadel.com/display/ITS-PL-Spire) for Europe.
- **Intranet BestFrAIend LLM Tech Stack**: System documentation is hosted at [https://confluence.exadel.com/display/AI-BestFrAIend](https://confluence.exadel.com/display/AI-BestFrAIend).`
      });
    }

    const isPlannerQuery = lowerMessage.includes("planner") || 
                           lowerMessage.includes("planer") || 
                           lowerMessage.includes("agenda") || 
                           lowerMessage.includes("tasks") || 
                           lowerMessage.includes("schedule") || 
                           lowerMessage.includes("my day") || 
                           lowerMessage.includes("mojego dnia") || 
                           lowerMessage.includes("moga dana") || 
                           lowerMessage.includes("tagesplan") || 
                           lowerMessage.includes("tagesplaner") || 
                           lowerMessage.includes("mon agenda") || 
                           lowerMessage.includes("ma journée");

    if (isPlannerQuery) {
      let localMorningTime = "09:30 AM";
      let morningActivity = "Morning Team Coffee & Digital sync-up";
      let midDayActivity = "EU Engineering Sync (m1) - general team pairing";
      let afternoonActivity = "IT compliance and security health checks";
      let keyRecs: string[] = [];
      let hrLead = "Global HR Lead";
      let office = "Exadel Hub";

      if (region === 'PL') {
        localMorningTime = "10:00 AM";
        morningActivity = "Warsaw morning Coffee & Sync (Warsaw Spire Reception)";
        midDayActivity = "EU Engineering Sync (m1) - Cross-Region pair workspace integration";
        afternoonActivity = "Review Warsaw Spire PL-Spire VPN compliance secure credentials";
        hrLead = "Anna Kowalska";
        office = "Warsaw Spire";
        keyRecs = [
          "Connect with Polish HR Business Partner Anna Kowalska regarding 'Urlop' holiday balance tracking.",
          "Check out the upcoming Warsaw Spire Tech Talk: Prompting & RAG Systems event scheduled for June 18."
        ];
      } else if (region === 'HR') {
        localMorningTime = "09:30 AM";
        morningActivity = "Zagreb Matrix Building Desk check-in & setup";
        midDayActivity = "EU Engineering Sync (m1) - Matrix Zagreb team alignment";
        afternoonActivity = "Review open Hardware Procurement ticket (t2) status with Sarah Miller";
        hrLead = "Marko Horvat";
        office = "Matrix Zagreb";
        keyRecs = [
          "Discuss supplemental HZZO coverage + local wellness vouchers with Marko Horvat.",
          "Ensure your workstation desk is booked on MatrixDesk app for upcoming midsummer BBQ networking session."
        ];
      } else if (region === 'DE') {
        localMorningTime = "09:00 AM";
        morningActivity = "Berlin Virtual setup session with Regional IT Lead";
        midDayActivity = "EU Engineering Sync (m1) - Berlin - Warsaw connection";
        afternoonActivity = "Participate in local GDPR compliance & VPN node DE-Berlin auditing";
        hrLead = "Elena Wagner";
        office = "Berlin Hub";
        keyRecs = [
          "Sign up for the Berlin AI Ethics Forum occurring June 25.",
          "Inquire about standard 'Verpflegungsmehraufwand' with Elena Wagner."
        ];
      } else if (region === 'FR') {
        localMorningTime = "09:30 AM";
        morningActivity = "Welcome breakfast with France Lead (Paris Delivery Center)";
        midDayActivity = "EU Engineering Sync (m1) - Paris team onboarding sync";
        afternoonActivity = "Verification of French Mutuelle coverage & Ticket Restaurant";
        hrLead = "Marie Dubois";
        office = "Paris Office";
        keyRecs = [
          "Submit French social insurance details to HR partner Marie Dubois.",
          "Review CNIL data guidelines for secure VPN nodes (FR-Paris)."
        ];
      } else if (region === 'US') {
        localMorningTime = "09:00 AM";
        morningActivity = "West Coast Stand-Up meeting & remote hardware delivery check";
        midDayActivity = "Review US Advantage Plans & Premium 401k match structure (5%)";
        afternoonActivity = "Submit mileage expense logs via SAP Concur with 67 cents/mile rate";
        hrLead = "Mark Thompson";
        office = "California Remote Hub";
        keyRecs = [
          "Review state-to-state tax nexus boundaries with US lead Mark Thompson.",
          "Complete compulsory OKTA multi-factor security clearance training."
        ];
      } else if (region === 'CA') {
        localMorningTime = "10:00 AM";
        morningActivity = "Montreal/Toronto remote onboarding buddy catchup";
        midDayActivity = "SunLife Supplemental health plan login verify & RRSP Match settings";
        afternoonActivity = "Draft regional expense spreadsheets & provincial taxation compliance checklist";
        hrLead = "Mark Thompson";
        office = "Toronto Flex Desk";
        keyRecs = [
          "Check provincial variation guidelines with Mark Thompson.",
          "Test connection speeds on CA-Toronto VPN node in regional office."
        ];
      } else if (region === 'GE') {
        localMorningTime = "10:00 AM";
        morningActivity = "Collect Exadel badge & corporate laptop at Chavchavadze Tech Office, Tbilisi";
        midDayActivity = "Tbilisi Tech Center Local Agile sync with Regional mentor";
        afternoonActivity = "IT Device & Local Security crowdstrike compliance session";
        hrLead = "Nina Bakradze";
        office = "Tbilisi Tech Office";
        keyRecs = [
          "Review Ardi medical private health insurance provider details with Nina Bakradze.",
          "Join local Slack channel #georgia-dev for live office coordinate updates."
        ];
      } else if (region === 'BR') {
        localMorningTime = "10:00 AM";
        morningActivity = "São Paulo Hub - Welcome Coffee & remote desktop credentials configuration";
        midDayActivity = "Av. Paulista hybrid team meet on local project status";
        afternoonActivity = "BR-SaoPaulo VPN cluster verification and LGPD compliance audit";
        hrLead = "Lucas Silva";
        office = "São Paulo Office";
        keyRecs = [
          "Request Vale-Refeição benefit card activation with Lucas Silva.",
          "Read Brazilian onboarding handbooks for hybrid hot-desking details."
        ];
      } else if (region === 'CL') {
        localMorningTime = "10:00 AM";
        morningActivity = "Santiago Innovation Hub IT partner orientation and hardware kickoff";
        midDayActivity = "LATAM regional operational coordination sync with Santiago lead";
        afternoonActivity = "CL-Santiago VPN security protocols checks and corporate laptop agent test";
        hrLead = "Sofía Gomez";
        office = "Santiago Innovation Hub";
        keyRecs = [
          "Coordinate dental booster plan options with Sofía Gomez.",
          "Book a desk at our co-working hybrid office via Santiago channel."
        ];
      } else if (region === 'BY') {
        localMorningTime = "10:00 AM";
        morningActivity = "Minsk Dev Hub - Pickup laptop and team introductions";
        midDayActivity = "Joint Minsk Agile sprint alignment and project kickoff";
        afternoonActivity = "National business travel per diem Ministry of Finance rules walk-through";
        hrLead = "Yury Petrov";
        office = "Minsk Dev Hub";
        keyRecs = [
          "Discuss Belgosstrakh health package benefits with Yury Petrov.",
          "Review BY-Minsk VPN node security credentials."
        ];
      } else {
        keyRecs = [
          "Contact Global HR representative if you have any questions.",
          "Ensure all your devices are correctly updated."
        ];
      }

      try {
        const translatePrompt = `
          You are a professional geo-aware intranet assistant. 
          Generate an incredibly beautiful Day Planner/Agenda response.
          The response MUST be written in the user selected language "${language}". If language is "PL", write in Polish; "DE", write in German; "HR", write in Croatian; "FR", write in French; else write in standard English.
          
          Generate a beautiful markdown table of their day on Wednesday, June 3, 2026.
          Tailor it for Exadel region "${region}" (Office: ${office}).
          Include these schedule items:
          - ${localMorningTime}: ${morningActivity}
          - 11:30 AM: ${midDayActivity}
          - 02:00 PM: ${afternoonActivity}
          - 04:30 PM: Focus Session, Personal Administration and sync with HR Lead ${hrLead}
          
          Then, add a section called "Key Recommendations for ${region}" (translated to ${language}) containing:
          ${keyRecs.map(r => "- " + r).join("\n")}
          
          Format it beautifully and professionally. Include an appropriate top header block stating "Day Planner for ${region}" and "Wednesday, June 3, 2026/Środa, 3 czerwca 2026 r./etc." in the output language. Make sure all items are translated to ${language} naturally!
        `;

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: [{ role: 'user', parts: [{ text: translatePrompt }] }]
        });
        
        return res.json({ content: response.text });
      } catch (err) {
        console.error("Gemini failed for planner prompt, using static fallback:", err);
        const isPl = language === 'PL';
        const isHr = language === 'HR';
        const isDe = language === 'DE';
        const isFr = language === 'FR';

        if (isPl) {
          return res.json({ content: `### 🗓️ Twój Planer Dnia — Środa, 3 czerwca 2026 r. (Region: ${region})

Witaj w Twoim osobistym asystencie dnia! Oto Twój dzisiejszy harmonogram spotkań i zadań przygotowany specjalnie dla Twojego regionu:

| Czas (local) | Wydarzenie / Zadanie | Status / Szczegóły |
| :--- | :--- | :--- |
| **${localMorningTime}** | ${region === 'PL' ? 'Kawa poranna i orientacja w Warsaw Spire' : 'Poranny rozruch i synchronizacja z zespołem'} | Rozpoczęcie dnia |
| **11:30** | EU Engineering Sync (m1) | Integracja komunikacji między regionami i pary inżynieryjne |
| **14:00** | Przegląd zgodności IT i systemów bezpieczeństwa | Weryfikacja OKTA / VPN / CrowdStrike |
| **16:30** | Czas na skupienie & kontakt z liderem HR (${hrLead}) | Podsumowanie zadań |

**📌 Sugerowane działania dzisiaj dla regionu ${region}:**
1. ${keyRecs[0] || 'Skontaktuj się z zespołem HR w celu weryfikacji danych.'}
2. ${keyRecs[1] || 'Upewnij się, że urządzenie służbowe jest zgodne z najnowszymi standardami zabezpieczeń.'}

*Życzymy produktywnego dnia pracy!*` });
        } else if (isHr) {
          return res.json({ content: `### 🗓️ Vaš Planer Dana — Srijeda, 3. lipnja 2026. (Regija: ${region})

Dobrodošli u dnevni asistent! Ovo je vaš raspored sastanaka i zadataka prilagođen vašoj regiji:

| Vrijeme (local) | Događaj / Zadatak | Status / Detalji |
| :--- | :--- | :--- |
| **${localMorningTime}** | Jutarnji kava sastanak i lokacija | Početak dana i lokalni zadatci |
| **11:30** | EU Engineering Sync (m1) | Sinkronizacija inženjerskih timova i radnih procesa |
| **14:00** | Provjera IT sustava i sigurnosti | Provjera OKTA / VPN / CrowdStrike sukladnosti |
| **16:30** | Rad u fokusu i sinkronizacija s HR partnerom (${hrLead}) | Evaluacija i planiranje |

**📌 Preporučene akcije za regiju ${region}:**
1. ${keyRecs[0] || 'Provjerite preostali broj dana godišnjeg odmora.'}
2. ${keyRecs[1] || 'Provjerite sukladnost uređaja s najnovijim sigurnosnim direktivama.'}

*Želimo vam ugodan i produktivan radni dan!*` });
        } else if (isDe) {
          return res.json({ content: `### 🗓️ Ihr Tagesplaner — Mittwoch, 3. Juni 2026 (Region: ${region})

Willkommen in Ihrem persönlichen Tagesplaner! Hier ist Ihr heutiger Zeitplan für Besprechungen und Aufgaben:

| Zeit (local) | Ereignis / Aufgabe | Status / Details |
| :--- | :--- | :--- |
| **${localMorningTime}** | Morgenkaffee & Projektkoordination | Start in den Tag am Standort |
| **11:30** | EU Engineering Sync (m1) | Abstimmung zwischen den Standorten |
| **14:00** | IT-Sicherheit & Konformitätsprüfung | VPN / OKTA / CrowdStrike Status |
| **16:30** | Fokuszeit & Abstimmung mit HR-Leiter (${hrLead}) | Abschluss der administrativen Aufgaben |

**📌 Empfohlene Aktionen für Region ${region}:**
1. ${keyRecs[0] ?? 'Kontaktieren Sie Ihren HR-Business Partner.'}
2. ${keyRecs[1] ?? 'Überprüfen Sie Ihre VPN-Verbindungseinstellungen.'}

*Wir wünschen Ihnen einen erfolgreichen Arbeitstag!*` });
        } else if (isFr) {
          return res.json({ content: `### 🗓️ Votre Agenda de la Journée — Mercredi 3 Juin 2026 (Région : ${region})

Voici votre planning des réunions et tâches recommandées aujourd'hui pour votre région :

| Heure (local) | Événement / Tâche | Statut / Détails |
| :--- | :--- | :--- |
| **${localMorningTime}** | Café de bienvenue & lancement local | Lancement de la journée de travail |
| **11:30** | EU Engineering Sync (m1) | Session d'alignement technique inter-régions |
| **14:00** | Alignement sécurité IT & conformité réseau | Vérification OKTA / VPN / CrowdStrike |
| **16:30** | Session autonome & synchronisation RH (${hrLead}) | Synthèse de la journée |

**📌 Actions suggérées pour la région ${region} :**
1. ${keyRecs[0] ?? 'Veuillez soumettre vos justificatifs de transport ou de mutuelle.'}
2. ${keyRecs[1] ?? 'Vérifiez la bonne configuration de vos accès VPN sécurisés.'}

*Excellente journée de travail !*` });
        } else {
          return res.json({ content: `### 🗓️ Your Day Planner — Wednesday, June 3, 2026 (Region: ${region})

Welcome to your personalized daily assistant! Here is your tailored schedule of meetings and core actionable items for today:

| Time (local) | Meeting / Task Item | Status / Details |
| :--- | :--- | :--- |
| **${localMorningTime}** | ${morningActivity} | Start of the day |
| **11:30 AM** | ${midDayActivity} | Regional and engineering synchronization |
| **02:00 PM** | ${afternoonActivity} | IT Compliance & network security validation |
| **04:30 PM** | Focus Session, Personal Administration and sync with HR Lead **${hrLead}** | End of day review |

**📌 Key Recommendations for ${region}:**
1. ${keyRecs[0]}
2. ${keyRecs[1]}

*Have a highly productive day ahead!*` });
        }
      }
    }

    const systemInstruction = `
      You are 'BestFrAIend', the geo-aware internal AI companion for the company.
      Your primary source of truth is the provided Knowledge Base and FAQs, which contain regional addenda.
      
      CURRENT USER CONTEXT:
      - Region: ${region}
      - Selected Interface Language: ${language}
      
      CORE KNOWLEDGE:
      - Policies: ${JSON.stringify(KNOWLEDGE_BASE)}
      - FAQs: ${JSON.stringify(FAQS)}
      - Initiatives: ${JSON.stringify(AI_INITIATIVES)}
      - Meetings: ${JSON.stringify(MEETINGS)}
      - Feed: ${JSON.stringify(ORG_FEED)}

      OPERATIONAL RULES:
      1. REGIONAL FIRST: When asked about PTO or Benefits, prioritize data for the user's region (${region}).
      2. KNOWLEDGE FIRST: refer to [p1], [p2] etc.
      3. If a specific region addendum is missing, suggest checking with local HR (contact info in FAQ f2).
      4. RESPONSE LANGUAGE: You MUST respond in the selected interface language: "${language}". If "${language}" is PL, write in Polish. If HR, write in Croatian. If DE, write in German. If FR, write in French. If EN, write in English.
      5. TONE: Professional, geo-aware, and extremely helpful.
      
      NEVER SAY "I don't have an answer". If information is missing, guide the user to the "Policy Library" or suggest contacting the regional lead mentioned in FAQ.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [{ role: 'user', parts: [{ text: `System context: ${systemInstruction}\n\nUser Question: ${lastMessage}` }] }]
    });

    res.json({ content: response.text });
  } catch (error) {
    console.error("Gemini Error, using synthetic fallback:", error);
    const lastMessage = messages[messages.length - 1].content.toLowerCase();
    
    const isPl = language === 'PL';
    const isHr = language === 'HR';
    const isDe = language === 'DE';
    const isFr = language === 'FR';

    if (lastMessage.includes("news") || lastMessage.includes("feed") || lastMessage.includes("wiadom") || lastMessage.includes("vijest") || lastMessage.includes("nachricht") || lastMessage.includes("actu")) {
      const regionNews = ORG_FEED.filter(f => f.region === region || f.region === 'Global');
      const firstNews = regionNews[0] || ORG_FEED[4];
      
      if (isPl) {
        res.json({ content: `**Aktualności dla regionu ${region}:**\nWydarzenie: **${firstNews.title}**\nSzczegóły: ${firstNews.description}\nPrzejdź do zakładki Wiadomości Firmowe, aby zobaczyć cały feed.` });
      } else if (isHr) {
         res.json({ content: `**Vijesti za regiju ${region}:**\nDogađaj: **${firstNews.title}**\nOpis: ${firstNews.description}\nPosjetite odjeljak Vijesti i Objave za cijeli feed.` });
      } else if (isDe) {
         res.json({ content: `**Neuigkeiten für die Region ${region}:**\nTitel: **${firstNews.title}**\nBeschreibung: ${firstNews.description}\nBesuchen Sie das Unternehmens-Feed für alle Details.` });
      } else if (isFr) {
         res.json({ content: `**Actualités pour la région ${region} :**\nSujet : **${firstNews.title}**\nDescription : ${firstNews.description}\nConsultez le Fil d'Actualités pour voir l'ensemble des posts.` });
      } else {
        res.json({ content: `**Company Updates for region ${region}:**\nEvent: **${firstNews.title}**\nDescription: ${firstNews.description}\nVisit the Org Feed tab to see all posts.` });
      }
    } else if (lastMessage.includes("meeting") || lastMessage.includes("spotkan") || lastMessage.includes("sastan") || lastMessage.includes("besprech") || lastMessage.includes("réunion")) {
      const latest = MEETINGS[MEETINGS.length - 1];
      if (isPl) {
        res.json({ content: `Ostatnia synchronizacja rynkowa: **${latest.title}**.\nPodsumowanie: ${latest.summary}` });
      } else if (isHr) {
        res.json({ content: `Zadnji sinkronizacijski sastanak: **${latest.title}**.\nSažetak: ${latest.summary}` });
      } else if (isDe) {
        res.json({ content: `Letztes Meeting-Protokoll: **${latest.title}**.\nZusammenfassung: ${latest.summary}` });
      } else if (isFr) {
        res.json({ content: `Dernier compte-rendu de réunion : **${latest.title}**.\nRésumé : ${latest.summary}` });
      } else {
        res.json({ content: `The latest coordinator sync covers **'${latest.title}'**:\n*Summary*: ${latest.summary}` });
      }
    } else if (lastMessage.includes("pto") || lastMessage.includes("vacation") || lastMessage.includes("urlop") || lastMessage.includes("godišnj") || lastMessage.includes("urlaub") || lastMessage.includes("congé")) {
      const pto = KNOWLEDGE_BASE.find(k => k.id === 'p1');
      const addendum = pto?.regions?.[region as keyof typeof pto.regions] || "Accrual varies by contract. Check with your regional HR Specialist.";
      
      if (isPl) {
        res.json({ content: `### 🌴 Zasady dotyczące urlopów (Region: ${region}) [p1]\n\nStandardowe zasady urlopowe:\n* **Lokalny Aneks dla ${region}**: ${addendum}\n\nAby złożyć wniosek, użyj szybkiej akcji "Wniosek o urlop" na pulpicie.` });
      } else if (isHr) {
        res.json({ content: `### 🌴 Pravila o godišnjim odmorima (Regija: ${region}) [p1]\n\nStandardne smjernice:\n* **Regionalni Dodatak za ${region}**: ${addendum}\n\nZa zahtjev upotrijebite brzu akciju "Zahtjev za Godišnji" na nadzornoj ploči.` });
      } else if (isDe) {
        res.json({ content: `### 🌴 Urlaubsrichtlinie (Region: ${region}) [p1]\n\nAllgemeines Guthaben:\n* **Lokaler Zusatz für ${region}**: ${addendum}\n\nBeantragen Sie Ihren Urlaub direkt über die Schnellaktion "Urlaub beantragen" auf Ihrem Dashboard.` });
      } else if (isFr) {
        res.json({ content: `### 🌴 Politique de Congés (Région : ${region}) [p1]\n\nModalités de calcul :\n* **Complément local pour ${region}** : ${addendum}\n\nFaites votre demande via l'action rapide "Demander un Congé" depuis votre écran principal.` });
      } else {
        res.json({ content: `### 🌴 Paid Time Off Policy (Region: ${region}) [p1]\n\nStandard guidelines:\n* **Local Addendum for ${region}**: ${addendum}\n\nTo request PTO, use the "Request PTO" action button on your main Dashboard.` });
      }
    } else if (lastMessage.includes("expense") || lastMessage.includes("travel") || lastMessage.includes("reimburse") || lastMessage.includes("wydatek") || lastMessage.includes("troš") || lastMessage.includes("spesen") || lastMessage.includes("note de frais")) {
      const exp = KNOWLEDGE_BASE.find(k => k.id === 'p2');
      const addendum = exp?.regions?.[region as keyof typeof exp.regions] || "Follow GSA standard guidelines.";
      
      if (isPl) {
        res.json({ content: `### 💰 Polityka Wydatków i Podróży służbowych [p2]\n\nWszystkie rachunki powyżej 10 USD muszą być rozliczone w ciągu 30 dni.\n* **Aneks regionalny dla ${region}**: ${addendum}` });
      } else if (isHr) {
        res.json({ content: `### 💰 Pravila o Troškovima i Putovanjima [p2]\n\nRačuni iznad 10 USD moraju se prijaviti u roku od 30 dana.\n* **Regionalni Dodatak za ${region}**: ${addendum}` });
      } else if (isDe) {
        res.json({ content: `### 💰 Spesen- und Reisekostenrichtlinie [p2]\n\nBelege über $10 müssen innerhalb von 30 Tagen eingereicht werden.\n* **Lokaler Zusatz für ${region}**: ${addendum}` });
      } else if (isFr) {
        res.json({ content: `### 💰 Notes de Frais et Déplacements [p2]\n\nLes justificatifs supérieurs à 10 $ doivent être soumis sous 30 jours.\n* **Règle locale pour ${region}** : ${addendum}` });
      } else {
        res.json({ content: `### 💰 Travel & Expense Policy [p2]\n\nReceipts over $10 are required. Submit within 30 days.\n* **Regional Addendum for ${region}**: ${addendum}` });
      }
    } else if (lastMessage.includes("benefit") || lastMessage.includes("health") || lastMessage.includes("insurance") || lastMessage.includes("benefi") || lastMessage.includes("zdrav") || lastMessage.includes("versicherung") || lastMessage.includes("mutuelle")) {
      const ben = KNOWLEDGE_BASE.find(k => k.id === 'p3');
      const addendum = ben?.regions?.[region as keyof typeof ben.regions] || "Medical plans are provided regionally. Please contact HR Partner.";
      
      if (isPl) {
        res.json({ content: `### 🫂 Benefity i Ubezpieczenie Zdrowotne [p3]\n\n* **Lokalny pakiet dla ${region}**: ${addendum}` });
      } else if (isHr) {
        res.json({ content: `### 🫂 Zdravstvene pogodnosti i osiguranje [p3]\n\n* **Lokalne pogodnosti za ${region}**: ${addendum}` });
      } else if (isDe) {
        res.json({ content: `### 🫂 Zusatzleistungen & Krankenversicherung [p3]\n\n* **Lokales Paket für ${region}**: ${addendum}` });
      } else if (isFr) {
        res.json({ content: `### 🫂 Avantages et Couverture santé [p3]\n\n* **Complément local pour ${region}** : ${addendum}` });
      } else {
        res.json({ content: `### 🫂 Regional Health & Benefits [p3]\n\n* **Local Provider Package for ${region}**: ${addendum}` });
      }
    } else if (lastMessage.includes("password") || lastMessage.includes("it help") || lastMessage.includes("reset") || lastMessage.includes("hasło") || lastMessage.includes("lozink") || lastMessage.includes("kennwort") || lastMessage.includes("mot de passe")) {
      const faq = FAQS.find(f => f.id === 'f1');
      
      if (isPl) {
        res.json({ content: `**Pomoc techniczna IT:**\nAby zresetować hasło, użyj portalu samoobsługowego OKTA lub skontaktuj się z nami na firmowym kanale Slack #it-help.` });
      } else if (isHr) {
        res.json({ content: `**IT tehnička podrška:**\nLozinku možete resetirati putem OKTA portala ili nas potražite na Slack kanalu #it-help.` });
      } else if (isDe) {
        res.json({ content: `**IT-Support:**\nSetzen Sie Ihr Passwort selbstständig über OKTA zurück oder fragen Sie im Slack-Kanal #it-help nach Hilfe.` });
      } else if (isFr) {
         res.json({ content: `**Support Informatique :**\nPour réinitialiser votre mot de passe, utilisez le portail d'auto-assistance OKTA ou écrivez sur le canal Slack #it-help.` });
      } else {
        res.json({ content: `**IT Security Helpdesk:**\nTo reset your password, please use the OKTA self-service portal or post a query in our corporate Slack workspace at #it-help.` });
      }
    } else {
      const matched = KNOWLEDGE_BASE.filter(kb => 
        kb.tags.some(tag => {
          const lowerTag = tag.toLowerCase();
          const regex = new RegExp(`\\b${lowerTag}\\b`, 'i');
          return regex.test(lastMessage);
        }) ||
        lastMessage.toLowerCase().includes(kb.title.toLowerCase()) ||
        lastMessage.toLowerCase().includes(kb.content.toLowerCase())
      );

      if (matched.length > 0) {
        const article = matched[0];
        const addendum = article.regions?.[region as keyof typeof article.regions] || "Consult with your local office lead.";
        if (isPl) {
          res.json({ content: `### 📑 Polityka: ${article.title}\n\n${article.content}\n\n* **Kontekst lokalny dla ${region}**: ${addendum}` });
        } else if (isHr) {
          res.json({ content: `### 📑 Pravilnik: ${article.title}\n\n${article.content}\n\n* **Lokalni kontekst za ${region}**: ${addendum}` });
        } else if (isDe) {
          res.json({ content: `### 📑 Richtlinie: ${article.title}\n\n${article.content}\n\n* **Lokaler Kontext für ${region}**: ${addendum}` });
        } else if (isFr) {
          res.json({ content: `### 📑 Règle: ${article.title}\n\n${article.content}\n\n* **Contexte local pour ${region}** : ${addendum}` });
        } else {
          res.json({ content: `### 📑 Policy: ${article.title}\n\n${article.content}\n\n* **Local context for ${region}**: ${addendum}` });
        }
      } else {
        if (isPl) {
          res.json({ content: `Jestem gotowy pomóc w sprawach Twoich lokalnych zasad merytorycznych (${region})! Twoim koordynatorem HR jest **Anna Kowalska** (hr.pl@exadel.com). Możesz zadać mi pytanie o urlopy (PTO), koszty podróży, ubezpieczenia lub zabezpieczenia i hasła OKTA.` });
        } else if (isHr) {
          res.json({ content: `Spreman sam vam pomoći s vašim lokalnim pravilima (${region})! Vaš voditelj HR-a je **Marko Horvat** (hr.hr@exadel.com). Slobodno me pitajte o godišnjim odmorima, troškovima, osiguranju ili resetirjanju lozinki.` });
        } else if (isDe) {
          res.json({ content: `Ich stehe Ihnen gerne für alle Fragen zu den Richtlinien an Ihrem Standort (${region}) zur Verfügung! Ihre Ansprechpartnerin im Personalbereich ist **Elena Wagner** (hr.de@exadel.com). Sie können mich zu PTO, Reisekostenerstattungen, Versicherungen oder OKTA-Sicherheit befragen.` });
        } else if (isFr) {
          res.json({ content: `Je suis ravi de vous aider concernant vos règles locales (${region}) ! Votre contact RH est **Mark Thompson** (hr.ca@exadel.com). N'hésitez pas à me poser vos questions sur les congés (PTO), notes de frais, mutuelle ou mots de passe.` });
        } else {
          res.json({ content: `I'm fully trained and ready to help you navigate local policies for region **${region}**! Your regional HR coordinator is **${region === 'PL' ? 'Anna Kowalska' : region === 'HR' ? 'Marko Horvat' : region === 'DE' ? 'Elena Wagner' : 'Mark Thompson'}**. You can ask me details on PTO benefits, Concur travel claims, workspace insurance schemes, or standard security VPN passkeys.` });
        }
      }
    }
  }
});

app.get("/api/stats", (req, res) => res.json({
  activeUsers: 142 + Math.floor(Math.random() * 10),
  openTICKETS: TICKETS.length,
  remoteOffices: 8
}));

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
