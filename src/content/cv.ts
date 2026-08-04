// content/cv.ts — el CV real de Pedro, estructurado. Fuente de la vista
// "Ver como CV normal" (CVEscape). El escape hatch siempre disponible.

export interface CVJob {
  company: string;
  role: string;
  period: string;
  highlights: string[];
  stack?: string;
}

export interface CVProject {
  name: string;
  url?: string;
  year: string;
  note: string;
}

export interface CV {
  name: string;
  title: string;
  location: string;
  phone: string;
  email: string;
  linkedin: string;
  summary: string;
  experience: CVJob[];
  projects: CVProject[];
  skills: { label: string; items: string }[];
  languages: string;
}

export const cv: CV = {
  name: 'Pedro Mollehuanca Torres',
  title: 'UX · Full Stack Developer · Product Manager',
  location: 'Arequipa, Perú (GMT-5)',
  phone: '(+51) 993468012',
  email: 'pedromollehuanca@gmail.com',
  linkedin: 'https://www.linkedin.com/in/pedromollehuanca/',
  summary:
    'Profesional versátil con 10 años desarrollando productos digitales en Banca, Inmobiliario, Ecommerce, Automotriz y Educación. Enfoque en experiencias de usuario excepcionales y soluciones técnicas eficientes, entre roles de Product Manager, Fullstack Developer y UX.',
  experience: [
    {
      company: 'SaleAds',
      role: 'UX Engineer',
      period: 'Ene 2026 – Jun 2026',
      highlights: [
        'Interfaces y flujos para una plataforma SaaS de generación de contenido con IA (imágenes, copys, estrategias).',
        'Sistema de chat con contexto empresarial usando n8n + RAG (embeddings + búsqueda semántica sobre documentos internos).',
        'Integré MCP con Figma (sync de diseños al flujo de dev) y con GitHub (revisiones y PRs asistidos por IA).',
        'AI-driven development con Cursor y Claude Code: reduje ciclos de entrega ~40%.',
      ],
      stack: 'React 19, Next.js, TypeScript, TailwindCSS, TanStack Query, Zustand, shadcn/ui, Cursor, Claude Code',
    },
    {
      company: 'Periferia IT',
      role: 'Senior Frontend Engineer',
      period: 'Ene 2025 – Dic 2025',
      highlights: [
        'Dos plataformas institucionales (portal público de admisión + gestión interna) con React 18 + Next.js.',
        'Componentes reutilizables con shadcn/ui + Atomic Design: -50% en tiempo de nuevos módulos.',
        'Migré flujos críticos a React Native (offline + push): 4.2 en stores en las primeras semanas.',
        'Estado global con Zustand por slices (sesión, admisión, notificaciones), sin bugs de sincronización.',
      ],
      stack: 'React 18, React Native, Next.js, TypeScript, TailwindCSS, Zustand, TanStack Query, Expo',
    },
    {
      company: 'Orion Global',
      role: 'Software Engineer',
      period: 'Ene 2024 – Dic 2024',
      highlights: [
        'Dashboards administrativos complejos con React/TS/Redux + APIs REST y microservicios NestJS.',
        'Arquitectura modular (composición, lazy loading, code splitting): -35% bundle size.',
        'Optimicé queries MongoDB (índices compuestos, pipelines): -50% en tiempos de respuesta.',
      ],
      stack: 'React, TypeScript, Next.js, NestJS, Redux, Tailwind, Node, MongoDB',
    },
    {
      company: 'Crehana',
      role: 'FullStack Developer',
      period: 'Ene 2022 – Dic 2023',
      highlights: [
        'Nuevas funcionalidades del Main Hub (SaaS de RRHH, +200K usuarios activos).',
        "Construí la plataforma de IA 'Hana' (GPT-4): pipelines de prompts, embeddings de OpenAI, insights automáticos.",
        'Servicios y resolvers GraphQL con Django sobre ETL en Python, con contratos tipados en TS.',
        'Catálogo de Dashlets (NIVO, ECharts, Storybook) adoptado por 4 squads.',
      ],
      stack: 'React, GraphQL, Next.js, TypeScript, Storybook, Redux, Node, Python, Django',
    },
    {
      company: 'Remoters',
      role: 'FullStack Developer',
      period: 'Ene 2021 – Dic 2021',
      highlights: [
        'Backend NestJS: auth, perfiles, transacciones y wallets Web3 (Metamask, Smart Contracts en Solidity).',
        'Onboarding con NFT y validación en blockchain: -70% de fricción en el registro.',
        'Automaticé despliegues en AWS (EC2, S3, Amplify) con CI/CD sin downtime.',
      ],
      stack: 'React, Next.js, TypeScript, NestJS, Web3, Prisma, MySQL, MongoDB, AWS',
    },
    {
      company: 'Indra – BBVA',
      role: 'Frontend Developer',
      period: 'Jun 2019 – Dic 2020',
      highlights: [
        'Lideré accesibilidad WCAG 2.1 AA en la app móvil de BBVA (de ~0 a 80% de cumplimiento).',
        "Chatbot 'BLUE' con Dialogflow: -90% de consultas presenciales migradas al canal digital.",
        'Nuevos flujos para el segmento PYMES y +40% de cobertura de tests (Mocha, Karma).',
      ],
      stack: 'LitElement, JavaScript ES6, Mocha, Karma, Selenium',
    },
  ],
  projects: [
    { name: 'DPP', url: 'https://qrwdl-laaaa-aaaaj-qneyq-cai.icp0.io/en', year: '2024', note: 'WebApp blockchain (TypeScript, React, Vite, Motoko).' },
    { name: 'Publiauto', url: 'https://publiauto.vercel.app/', year: '2023', note: 'WebApp a medida (React, Next.js, Node).' },
    { name: 'Hostal Virreinal', url: 'https://www.hostalvirreinal.com/', year: '2023', note: 'WebApp a medida (React, Next.js, Node).' },
    { name: 'OH Summit (UCIC)', url: 'https://ohsummit.ucic.pe/', year: '2022', note: 'Landing a medida (Vue, Nuxt, Axios).' },
  ],
  skills: [
    { label: 'Lenguajes', items: 'JavaScript (avanzado), Node.js (intermedio), PHP · Python · Go (básico)' },
    { label: 'Frameworks', items: 'React, Vue, Next.js, React Native, NestJS, Tailwind, shadcn/ui, Zustand, TanStack Query' },
    { label: 'Datos', items: 'MongoDB, MySQL, PostgreSQL, GraphQL, Prisma' },
    { label: 'IA / Tooling', items: 'Claude Code, Cursor, MCP, RAG/embeddings, n8n, Figma, Storybook, Docker, Git' },
    { label: 'Producto / UX', items: 'Scrum, Kanban, Design Thinking, Design Sprint, User Research, Product Owner' },
  ],
  languages: 'Español (nativo) · Inglés (B1)',
};
