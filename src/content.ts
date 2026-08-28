/**
 * Centralized site content.
 * Edit copy, experience, projects, and links here. Nothing below is fabricated;
 * every value is verified. Follow the house style: no em-dashes in copy.
 */

export const profile = {
  name: "Armaan Punia",
  title: "Software Engineer",
  eyebrow: "SOFTWARE ENGINEER",
  location: "Gurugram, India",
  graduating: "2026",
  // Hero (rendered as: headline + gradient accent)
  headline: "I build backend systems and AI products that ship to production,",
  headlineAccent: "and move real numbers",
  subtext:
    "A backend-leaning engineer working across distributed systems, applied AI, and cloud. Three years, five internships, real impact at scale.",
  // About
  about: [
    "My center of gravity is distributed backend architecture and applied AI. On one side, Spring Cloud microservices: service discovery, gateways, centralized config. On the other, LLM agents, RAG, and MCP workflows. Cloud infrastructure holds it together.",
    "I am a final-year Computer Science student, but the work has not felt like a student's. Across five internships I have shipped production ERP and CRM features, migrated enterprise metadata into Collibra, and built an AI business-intelligence layer over 160M plus customer records.",
    "I care about systems that run in production and move real numbers, not demos. I write clean, typed, well-structured code, and I like problems where backend depth and applied AI meet.",
  ],
  email: "armaanpunia94@gmail.com",
  phone: "+91 7065755749",
  links: {
    linkedin: "https://linkedin.com/in/armaan-punia",
    github: "https://github.com/Armaan-94",
    leetcode: "https://leetcode.com/u/Armaan0904/",
  },
  resume: "/Armaan_Punia_Resume.pdf",
} as const;

export const education = {
  degree: "B.Tech, Computer Science and Engineering",
  school: "The NorthCap University, Gurugram",
  period: "2022 - 2026",
  cgpa: "8.77 / 10",
} as const;

export const stats: { label: string; value: string }[] = [
  { label: "CGPA", value: "8.77" },
  { label: "Internships", value: "5" },
  { label: "Records processed", value: "160M+" },
  { label: "Profitability lift", value: "~18%" },
];

export type Experience = {
  company: string;
  role: string;
  location: string;
  period: string;
  bullets: string[];
  stack: string[];
};

export const experience: Experience[] = [
  {
    company: "Biocipher Technologies",
    role: "Associate Executive Intern, Software Engineering",
    location: "Gurugram",
    period: "Apr 2026 - Aug 2026",
    bullets: [
      "Built an AI-powered business-intelligence and large-scale data-processing layer over 160M+ customer records, increasing profitability by 18% across the company's financial services.",
      "Designed and integrated scalable enterprise applications with Next.js, TypeScript, Python, DuckDB, and AI/ML workflows to automate data processing, analytics, and organization-wide insight sharing.",
      "Engineered CRM integrations consolidating multiple business services while streamlining digital marketing and operational workflows.",
      "Tested, optimized, and documented AI-powered Voice, SMS, Email, and WhatsApp communication modules, and wrote the technical training resources for AI automation agents.",
    ],
    stack: ["Next.js", "TypeScript", "Python", "DuckDB", "AI/ML"],
  },
  {
    company: "Dadata Consulting",
    role: "Associate Software Engineer Intern",
    location: "US-based company, remote",
    period: "Jan 2026 - Feb 2026",
    bullets: [
      "Delivered end-to-end metadata and technical-lineage migration into Collibra DGC for a US enterprise client.",
      "Built Spring Boot middleware that parsed Alteryx workflows and published assets through Collibra REST APIs.",
      "Automated technical lineage ingestion with Python and the Collibra Edge Lineage Harvester.",
    ],
    stack: ["Spring Boot", "Java", "Python", "Collibra", "REST APIs"],
  },
  {
    company: "BuziBrAIns",
    role: "Software Development Engineer Intern",
    location: "Bengaluru-based company, remote",
    period: "Jul 2025 - Oct 2025",
    bullets: [
      "Built production-ready ERP and CRM solutions by translating business requirements into scalable software features.",
      "Automated enterprise workflows with full-stack technologies, improving operational efficiency and reducing manual processes.",
    ],
    stack: ["Full-stack", "ERP", "CRM"],
  },
  {
    company: "VVDN Technologies",
    role: "Network and Wi-Fi Engineering Intern",
    location: "India",
    period: "Jul 2025 - Aug 2025",
    bullets: [
      "Wrote Python automation for Wi-Fi performance and protocol validation.",
      "Improved testing efficiency and diagnostic accuracy across network scenarios.",
    ],
    stack: ["Python", "Automation", "Networking"],
  },
  {
    company: "NCFL, Delhi Police",
    role: "Research Intern, Cyber Forensics",
    location: "Delhi",
    period: "Jun 2024 - Jul 2024",
    bullets: [
      "Built cyber-investigation tooling and performed forensic analysis on real case data.",
      "Recovered and analyzed 100+ classified files supporting active investigations.",
    ],
    stack: ["Cyber Forensics", "Python", "Investigation Tooling"],
  },
];

export type Project = {
  title: string;
  category: "Backend" | "AI/ML" | "Full-stack" | "Frontend" | "Algorithms" | "Web";
  description: string;
  stack: string[];
  code?: string;
  live?: string;
};

export const projects: Project[] = [
  {
    title: "Enterprise Food Delivery Microservices Platform",
    category: "Backend",
    description:
      "A distributed food-ordering backend split into independent Spring Cloud services: service discovery, API-gateway routing, a centralized config server, and Spring Security auth. My deep dive into real microservice architecture.",
    stack: ["Java", "Spring Boot", "Spring Cloud", "Spring Security", "MySQL"],
    code: "https://github.com/Armaan-94/Food-Delivery-System",
  },
  {
    title: "AI Answer Sheet Grader",
    category: "AI/ML",
    description:
      "An AI grading tool that reads scanned exam sheets with a vision LLM: extracts every question and handwritten answer, matches them by label even when out of order or split across pages, highlights the exact answer region, and generates a score with AI feedback.",
    stack: ["Next.js", "Gemini API", "pdf.js", "Tailwind CSS"],
    code: "https://github.com/Armaan-94/ai_assessment_extraction_application",
    live: "https://ai-assessment-extraction-applicatio.vercel.app",
  },
  {
    title: "Fake News Detector",
    category: "AI/ML",
    description:
      "An NLP classifier that flags misleading news. TF-IDF vectorization feeds a Multinomial Naive Bayes model, wrapped in a Flask web app you can paste an article into.",
    stack: ["Python", "Flask", "scikit-learn", "Jupyter"],
    code: "https://github.com/Armaan-94/Fake-News-Detector-AIML",
  },
  {
    title: "Developer Snippet Vault",
    category: "Full-stack",
    description:
      "A full-stack MERN vault for reusable code snippets: syntax highlighting, search and filters over a REST API, and an animated, responsive React UI.",
    stack: ["React", "Node.js", "Express", "MongoDB", "Tailwind"],
    code: "https://github.com/Armaan-94/developer-snippet-vault",
    live: "https://developer-snippet-vault.vercel.app",
  },
  {
    title: "Sorting Visualizer",
    category: "Algorithms",
    description:
      "An interactive playground that animates how sorting algorithms work: comparisons and swaps in real time, with adjustable array size and speed. Built in vanilla JS.",
    stack: ["JavaScript", "HTML", "CSS"],
    code: "https://github.com/Armaan-94/sorting-visualizer",
    live: "https://armaan-94.github.io/sorting-visualizer/",
  },
  {
    title: "Vidyantar",
    category: "Web",
    description:
      "The production marketing site for Vidyantar, a mentor-led coding-education platform. A content-driven Next.js front end, live on Vercel.",
    stack: ["Next.js", "React", "Vercel"],
    live: "https://vidyantar-website.vercel.app/",
  },
  {
    title: "Bank Landing Page",
    category: "Frontend",
    description:
      "A modern, fully responsive banking landing page: a study in clean layout, spacing, and cross-device polish, taken from Figma to component-driven React.",
    stack: ["React", "Tailwind", "JavaScript", "HTML", "CSS", "Figma"],
    code: "https://github.com/Armaan-94/bank_landing_page",
    live: "https://armaan-94.github.io/bank_landing_page/",
  },
];

export const skills: { group: string; items: string[] }[] = [
  {
    group: "Languages",
    items: ["Java", "Python", "TypeScript", "JavaScript", "SQL", "HTML/CSS"],
  },
  {
    group: "Backend & Frameworks",
    items: [
      "Spring Boot",
      "Spring Cloud",
      "Hibernate",
      "JUnit",
      "Node.js",
      "Express",
      "Flask",
      "REST APIs",
      "Microservices",
    ],
  },
  {
    group: "Frontend",
    items: ["React", "Next.js", "Tailwind CSS"],
  },
  {
    group: "Data",
    items: ["MySQL", "PostgreSQL", "MongoDB", "DuckDB"],
  },
  {
    group: "Cloud & DevOps",
    items: [
      "AWS (EC2, ECS, S3, Lambda)",
      "Docker",
      "Linux (Ubuntu)",
      "Unix shell",
      "Bash",
      "Git",
      "GitHub",
      "CI/CD",
    ],
  },
  {
    group: "AI Engineering",
    items: [
      "LLMs",
      "AI Agents",
      "RAG",
      "MCP",
      "Prompt Engineering",
      "AI Workflow Automation",
    ],
  },
  {
    group: "AI Tools",
    items: ["Claude Code", "ChatGPT", "Gemini", "Cursor", "GitHub Copilot"],
  },
  {
    group: "Other",
    items: [
      "Postman",
      "Collibra",
      "Data Governance",
      "Cloud Computing",
      "SDLC",
      "Cyber Security Fundamentals",
    ],
  },
];

export const leetcode = {
  url: profile.links.leetcode,
  solved: 197,
  easy: 167,
  medium: 30,
  hard: 0,
  submissionsPastYear: 250,
  activeDays: 173,
  badge: "50 Days Badge 2026",
} as const;

export const nav: { label: string; href: string }[] = [
  { label: "About", href: "#about" },
  { label: "Experience", href: "#experience" },
  { label: "Projects", href: "#projects" },
  { label: "Skills", href: "#skills" },
  { label: "Contact", href: "#contact" },
];
