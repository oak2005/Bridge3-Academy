export interface DocArticle {
  slug: string;
  title: string;
  category: "getting-started" | "curriculum" | "workshops" | "gamification" | "certification";
  categoryLabel: string;
  summary: string;
  readTime: string;
  updatedAt: string;
  tags: string[];
  keyTakeaways?: string[];
  content: {
    sections: {
      heading: string;
      body: string[];
      bullets?: string[];
      callout?: {
        type: "tip" | "note" | "important" | "warning";
        text: string;
      };
      codeBlock?: {
        language: string;
        code: string;
      };
      table?: {
        headers: string[];
        rows: string[][];
      };
    }[];
  };
}

export interface DocCategory {
  id: "getting-started" | "curriculum" | "workshops" | "gamification" | "certification";
  label: string;
  description: string;
  icon: string;
}

export const DOC_CATEGORIES: DocCategory[] = [
  {
    id: "getting-started",
    label: "Getting Started",
    description: "Essential guides to onboard, set your learning path, and navigate the academy.",
    icon: "🚀",
  },
  {
    id: "curriculum",
    label: "Curriculum",
    description: "Detailed syllabus breakdown across our 3 main tracks: General, Ecosystem or Sponsorship, and Skill set Track.",
    icon: "📚",
  },
  {
    id: "workshops",
    label: "Workshops & Project Reviews",
    description: "Project submission guidelines, peer reviews, practical evaluation rubrics, and capstone milestones.",
    icon: "🛠️",
  },
  {
    id: "gamification",
    label: "Gamification & Community",
    description: "Earning XP, unlocking skill badges, leveling up, and building your verified public portfolio.",
    icon: "🏆",
  },
  {
    id: "certification",
    label: "Certification & Standards",
    description: "Requirements for graduation, cryptographic verification hashes, and on-chain credentials.",
    icon: "🎓",
  },
];

export const DOC_ARTICLES: DocArticle[] = [
  // 1. Getting Started
  {
    slug: "welcome",
    title: "Welcome to Bridge3 Academy",
    category: "getting-started",
    categoryLabel: "Getting Started",
    summary: "An introduction to Bridge3 Academy, our mission for African talent, and how our structured platform empowers builders.",
    readTime: "3 min read",
    updatedAt: "September 2026",
    tags: ["introduction", "mission", "africa", "web3"],
    keyTakeaways: [
      "Bridge3 Academy replaces fragmented tutorials with structured, practical learning paths and verified deliverables.",
      "Designed specifically for ambitious African students, developers, designers, writers, and growth operators.",
      "Every milestone is verified through server-graded quizzes, hands-on workshops, and tamper-proof certificates.",
    ],
    content: {
      sections: [
        {
          heading: "The Bridge to Web3 in Africa",
          body: [
            "Across Africa, millions of brilliant students and builders are eager to participate in the decentralized global economy. However, traditional education systems lack Web3 curriculum, while online learning is plagued by chaotic YouTube playlists, outdated tutorials, and unverified promises.",
            "Bridge3 Academy was built to replace tutorial chaos with a structured, collegiate-grade learning experience tailored to African university students and emerging builders. We take you from zero foundational knowledge to production-ready competence.",
          ],
          callout: {
            type: "note",
            text: "Bridge3 Academy is 100% free for students. For sponsoring partners, supporting a cohort means reaching students at the exact moment they're learning the habits and tools they'll use for years.",
          },
        },
        {
          heading: "Our Core Pedagogical Philosophy",
          body: [
            "We believe true mastery requires more than watching videos. Bridge3 Academy operates on a four-pillar pedagogical framework:",
          ],
          bullets: [
            "Structured Theory: Bite-sized, progressive lessons that demystify consensus mechanics, cryptography, and modern digital workflows.",
            "Server-Graded Assessments: Automated quizzes that rigorously test comprehension before permitting module progression.",
            "Practical Workshop Submissions: Real code, Figma designs, content pieces, and growth proposals submitted for review.",
            "Rigorous Project Review: Experienced practitioners who evaluate your assignments, give actionable feedback, and approve your milestones.",
          ],
        },
        {
          heading: "What You Will Achieve",
          body: [
            "Upon completing your curriculum track, you will possess not just knowledge, but concrete proof of competence:",
            "• A public on-chain and off-chain verified Portfolio showcasing your approved assignments, XP, and badges.",
            "• An official, tamper-proof Certificate of Completion with a unique cryptographic verification hash.",
            "• Direct access to ecosystem bounties, hackathons, and remote job opportunities across top decentralized protocols.",
          ],
        },
      ],
    },
  },
  {
    slug: "student-onboarding",
    title: "Student Onboarding & Learning Journey",
    category: "getting-started",
    categoryLabel: "Getting Started",
    summary: "Step-by-step guide to signing in with Google, selecting your specialization track, and tailoring your experience.",
    readTime: "4 min read",
    updatedAt: "September 2026",
    tags: ["auth", "onboarding", "profile", "setup"],
    keyTakeaways: [
      "Authentication uses Google OAuth for secure, frictionless access without passwords.",
      "Onboarding captures your university, role interests, and primary specialization track.",
      "You can adjust your profile preferences anytime from Account & Settings.",
    ],
    content: {
      sections: [
        {
          heading: "Step 1: One-Click Authentication",
          body: [
            "Bridge3 Academy utilizes Google OAuth for secure, frictionless authentication. We deliberately do not store passwords, eliminating credential theft vulnerabilities.",
            "Verified waitlist scholars sign in with their authorized Google account to access their learning headquarters.",
          ],
          callout: {
            type: "tip",
            text: "Use the Google account you check regularly so you don't miss project review feedback and live event notifications.",
          },
        },
        {
          heading: "Step 2: Profile Customization",
          body: [
            "Upon first sign-in, the onboarding wizard will guide you through three quick questions to customize your curriculum:",
          ],
          bullets: [
            "University / Institution: Connect with fellow alumni and track your campus's position on the academy leaderboard.",
            "Experience Level: Choose between Beginner (new to crypto), Intermediate (familiar with wallets & tokens), or Advanced (active developer/builder).",
            "Curriculum Pathway: Choose your primary focus: General Track, Ecosystem or Sponsorship Track, or Skill set Track.",
          ],
        },
        {
          heading: "Step 3: Navigating Your Dashboard",
          body: [
            "Once onboarded, your dashboard becomes your daily learning headquarters. From the left sidebar, you can navigate:",
            "• Dashboard: Overview of today's recommended lesson, overall track progress, and upcoming community workshops.",
            "• My Courses: Complete module syllabus with lesson-by-lesson progress tracking.",
            "• Workshops: Interactive coding, writing, and design challenges requiring hands-on submissions.",
            "• Assessments: Module quizzes and capstone project requirements.",
            "• Portfolio: Your public showcase highlighting verified accomplishments.",
            "• Certification: Real-time track completion tracking and certificate issuance portal.",
          ],
        },
      ],
    },
  },
  {
    slug: "learning-workflow",
    title: "The Complete Learning Workflow",
    category: "getting-started",
    categoryLabel: "Getting Started",
    summary: "How lessons, quizzes, workshop assignments, and project reviews connect to build genuine mastery.",
    readTime: "5 min read",
    updatedAt: "September 2026",
    tags: ["workflow", "classroom", "quizzes", "workshops"],
    keyTakeaways: [
      "Each module follows a 4-step cadence: Study → Quiz → Build → Review.",
      "Quizzes test recall with an 80% passing threshold and immediate server feedback.",
      "Workshops require building real artifacts evaluated by experienced practitioners.",
    ],
    content: {
      sections: [
        {
          heading: "The 4-Step Module Cadence",
          body: [
            "Education at Bridge3 Academy is organized into modular units. To guarantee retention and real skills, every module follows an identical, battle-tested progression:",
          ],
          table: {
            headers: ["Step", "Action", "Requirement", "Outcome"],
            rows: [
              ["1. Study", "Read module lessons & interactive guides", "Mark lessons complete", "Unlocks module quiz"],
              ["2. Assess", "Take timed, server-graded quiz", "Score 80%+ to pass", "Unlocks workshop brief & earns XP"],
              ["3. Build", "Complete practical workshop assignment", "Submit GitHub repo or live link", "Submitted to Project Review queue"],
              ["4. Review", "Reviewers inspect submission against rubric", "Review approval", "Module 100% complete; badge awarded"],
            ],
          },
        },
        {
          heading: "Lesson Classroom Features",
          body: [
            "Our classroom interface is distraction-free, optimized for both desktop monitors and mobile devices with spotty internet connectivity. Each lesson includes:",
            "• Code Sandboxes & Syntax Highlighting: Clarity, Solidity, Rust, and JavaScript examples formatted cleanly.",
            "• Reading Time Estimates: Plan your study schedule with precision.",
            "• Complete & Next Navigation: Automatic progress syncing to your Supabase student record.",
          ],
          callout: {
            type: "important",
            text: "Progress is recorded server-side. If your internet disconnects mid-lesson, your completed progress is preserved upon reconnecting.",
          },
        },
      ],
    },
  },

  // 2. Curriculum
  {
    slug: "curriculum-overview",
    title: "Curriculum Architecture & Philosophy",
    category: "curriculum",
    categoryLabel: "Curriculum",
    summary: "Comprehensive breakdown of Bridge3 Academy's three tracks: General Track, Ecosystem or Sponsorship Track, and Skill set Track.",
    readTime: "4 min read",
    updatedAt: "September 2026",
    tags: ["curriculum", "general", "ecosystem", "skillset", "overview"],
    keyTakeaways: [
      "The General Track establishes complete foundational competence in blockchain mechanics and digital custody.",
      "The Ecosystem or Sponsorship Track connects students with partner protocols, developer grants, and real tooling.",
      "The Skill set Track offers practical training for high-demand digital and Web3 roles.",
    ],
    content: {
      sections: [
        {
          heading: "Our Three Core Curriculum Tracks",
          body: [
            "Bridge3 Academy replaces chaotic playlists and tutorial fragmentation with a structured collegiate curriculum built around three primary tracks:",
            "1. General Track: Required for all scholars. Establishes core cryptographic principles, decentralized consensus, Bitcoin, wallet custody, and smart contract primitives.",
            "2. Ecosystem or Sponsorship Track: Built in partnership with leading protocols and foundations. For sponsors, it means reaching students at the exact moment they're learning the habits and tools they'll use for years. Students gain direct experience with partner architectures, grants, and real bounties.",
            "3. Skill set Track: Practical, career-focused specializations for modern digital careers: Content creation/writing, Community Management, Designer (UI/UX, Web, Graphics and more), Social Media Manager, Prompt Engineering, Technical/Growth Writing, Developer (Depend on partnership) and much more.",
          ],
        },
        {
          heading: "Tailored for the African Job Market",
          body: [
            "Web3 companies hire remotely across global time zones. Our curriculum is tailored to prepare African youth for remote roles across engineering, community leadership, visual design, and ecosystem operations.",
            "Every assignment simulates real deliverables expected by leading decentralized protocols and venture-backed startups.",
          ],
          callout: {
            type: "tip",
            text: "All scholars begin with the General Track. Once foundational competencies are verified, you unlock the Ecosystem or Sponsorship Track and your chosen Skill set Track.",
          },
        },
      ],
    },
  },
  {
    slug: "track-general",
    title: "General Track: Web3 & Bitcoin Foundations",
    category: "curriculum",
    categoryLabel: "Curriculum",
    summary: "Foundational syllabus covering blockchain architecture, Bitcoin, Proof of Work, cryptographic hashing, custody, and smart contract primitives.",
    readTime: "5 min read",
    updatedAt: "September 2026",
    tags: ["general", "bitcoin", "cryptography", "foundations"],
    keyTakeaways: [
      "Explains Byzantine Fault Tolerance and Satoshi Nakamoto's breakthrough.",
      "Covers public/private key cryptography, mnemonic seed phrases, and self-custody.",
      "Explores Layer 1 and Layer 2 scaling architectures and smart contract fundamentals.",
    ],
    content: {
      sections: [
        {
          heading: "What the General Track is For",
          body: [
            "The General Track is designed for all incoming students to establish an unshakeable foundation in decentralized systems. It demystifies how blockchains operate, why Bitcoin represents digital scarcity, and how to safely navigate Web3 protocols without relying on third-party custodians.",
            "Students transition from passive observers to confident practitioners with hands-on understanding of transactions, security models, and wallet hygiene.",
          ],
        },
        {
          heading: "Module 1: The Evolution of Money & Bitcoin",
          body: [
            "Understand why decentralized currency matters, especially in emerging economies facing local currency inflation and cross-border remittance fees:",
          ],
          bullets: [
            "From commodity money and fiat currencies to digital scarcity.",
            "The double-spend problem and how Bitcoin solved it with Proof of Work.",
            "Block headers, Merkle trees, and cryptographic difficulty adjustment.",
            "Halving cycles, fixed supply economics, and long-term security models.",
          ],
        },
        {
          heading: "Module 2: Applied Cryptography & Custody",
          body: [
            "Hands-on understanding of how blockchain addresses are generated and secured:",
          ],
          bullets: [
            "Elliptic Curve Digital Signature Algorithm (ECDSA) and Schnorr signatures.",
            "SHA-256 and RIPEMD-160 cryptographic hash functions.",
            "BIP-39 mnemonic seed phrase generation and derivation paths.",
            "Hardware wallets, multi-signature vaults, and cold storage best practices.",
          ],
          callout: {
            type: "warning",
            text: "Security is non-negotiable. Scholars are taught never to store private keys in cloud storage, emails, or unencrypted text files.",
          },
        },
        {
          heading: "Module 3: Decentralized Networks & Layer 2 Scaling",
          body: [
            "Why the blockchain trilemma (Decentralization, Security, Scalability) exists, and how Layer 2 networks (Rollups, State Channels, and Stacks) scale settlement layers without compromising security.",
          ],
        },
      ],
    },
  },
  {
    slug: "track-ecosystem",
    title: "Ecosystem or Sponsorship Track: Protocol Integration & Partner Challenges",
    category: "curriculum",
    categoryLabel: "Curriculum",
    summary: "How blockchain ecosystems operate, protocol integrations, sponsored partner challenges, grant funding, and community governance.",
    readTime: "5 min read",
    updatedAt: "September 2026",
    tags: ["ecosystem", "sponsorship", "protocols", "governance"],
    keyTakeaways: [
      "Explore major Layer 1 and Layer 2 ecosystems and partner protocols.",
      "Understand protocol grant applications, hackathon bounties, and ecosystem expansion.",
      "For sponsors, it means reaching students at the exact moment they're learning the habits and tools they'll use for years.",
    ],
    content: {
      sections: [
        {
          heading: "What the Ecosystem Track is For",
          body: [
            "The Ecosystem or Sponsorship Track connects students directly with active blockchain networks and protocol partners. For students, it provides practical experience with real protocol architectures, testnets, developer grants, and ecosystem bounties.",
            "For ecosystem partners and sponsors, supporting a cohort means reaching students at the exact moment they're learning the habits and tools they'll use for years. Instead of passive marketing, sponsors integrate their technologies, developer tooling, and community initiatives directly into student workshops.",
          ],
        },
        {
          heading: "Module 1: Protocol Architecture & Ecosystem Participation",
          body: [
            "Decentralized networks thrive on active participant ecosystems. In this module, scholars analyze leading protocol architectures:",
          ],
          bullets: [
            "Bitcoin Layer 2s, Ethereum rollups, and multi-chain interoperability standards.",
            "Tokenomics design: inflation schedules, staking rewards, and utility sinks.",
            "Running nodes, RPC endpoints, and block explorers.",
            "Understanding testnets, faucets, and safe contract verification.",
          ],
        },
        {
          heading: "Module 2: Sponsored Bounties, Grants & Partner Integration",
          body: [
            "Bridge3 partners directly with Web3 foundations and protocols to offer sponsored challenges and real compensation opportunities:",
          ],
          bullets: [
            "How protocol foundation grants work and how to write a winning RFP proposal.",
            "Deconstructing hackathon judging rubrics and structuring minimum viable products (MVPs).",
            "Completing sponsored workshops with direct project review.",
          ],
          callout: {
            type: "tip",
            text: "Top students completing sponsored workshops are directly introduced to partner talent pipelines for internships and contractor roles.",
          },
        },
        {
          heading: "Module 3: DAO Governance & Decentralized Operations",
          body: [
            "Hands-on experience with decentralized autonomous organizations: token-weighted voting, Snapshot proposals, multi-sig treasury management, and community consensus.",
          ],
        },
      ],
    },
  },
  {
    slug: "track-skillset",
    title: "Skill set Track: Career Specializations",
    category: "curriculum",
    categoryLabel: "Curriculum",
    summary: "Career-focused practical specializations: Content creation/writing, Community Management, Designer (UI/UX, Web, Graphics and more), Social Media Manager, Prompt Engineering, Technical/Growth Writing, Developer (Depend on partnership) and much more.",
    readTime: "6 min read",
    updatedAt: "September 2026",
    tags: ["skillset", "design", "growth", "developer", "career"],
    keyTakeaways: [
      "Practical tracks mapped directly to active digital and Web3 roles.",
      "Specializations include Content creation/writing, Community Management, Designer (UI/UX, Web, Graphics and more), Social Media Manager, Prompt Engineering, Technical/Growth Writing, Developer (Depend on partnership) and much more.",
      "Every student builds a verified portfolio project and capstone deliverable.",
    ],
    content: {
      sections: [
        {
          heading: "What the Skill set Track is For",
          body: [
            "The Skill set Track turns foundational knowledge into marketable, career-ready competence. The global digital economy requires diverse talent beyond raw protocol development. This track trains students across essential operational, creative, and technical roles:",
            "• Content creation/writing",
            "• Community Management",
            "• Designer (UI/UX, Web, Graphics and more)",
            "• Social Media Manager",
            "• Prompt Engineering",
            "• Technical/Growth Writing",
            "• Developer (Depend on partnership) and much more.",
          ],
        },
        {
          heading: "Pathway 1: Content Creation, Growth Writing & Technical Documentation",
          body: [
            "Prepares students for roles in Content creation/writing and Technical/Growth Writing. Students learn how to distill complex protocol mechanics into engaging articles, release notes, grant updates, and educational guides:",
          ],
          bullets: [
            "Technical Documentation: Writing clear developer guides, API references, and onboarding walk-throughs.",
            "Growth & Ecosystem Writing: Crafting case studies, grant applications, and analytical deep dives.",
            "Editorial Strategy: Managing content calendars, newsletters, and publication workflows.",
          ],
        },
        {
          heading: "Pathway 2: Community Management & Social Media Strategy",
          body: [
            "Prepares students for roles in Community Management and Social Media Manager. Focuses on building active, healthy digital communities across global time zones:",
          ],
          bullets: [
            "Community Operations: Managing Discord, Telegram, and developer community forums.",
            "Social Media Management: Developing social campaigns, viral storytelling, and live audio events.",
            "Ambassador Programs: Structuring campus clubs, regional meetups, and student developer chapters.",
          ],
        },
        {
          heading: "Pathway 3: Designer (UI/UX, Web, Graphics and more)",
          body: [
            "The greatest barrier to Web3 adoption is confusing user experience. This pathway trains designers across UI/UX, Web design, and Graphic design to make decentralized apps approachable and delightful:",
          ],
          bullets: [
            "Web3 UX Architecture: Designing intuitive wallet connection flows, transaction modals, and error states.",
            "Web & Graphic Design: Crafting landing pages, marketing visual systems, and brand guidelines.",
            "Design Systems: Building accessible component libraries and interactive prototypes in Figma.",
          ],
        },
        {
          heading: "Pathway 4: Prompt Engineering & AI Workflows",
          body: [
            "Equips students with modern Prompt Engineering and AI-assisted workflows to accelerate research, automate repetitive operations, and build intelligent assistants:",
          ],
          bullets: [
            "Structured Prompting: Designing reproducible system prompts, few-shot examples, and evaluation criteria.",
            "Operational Automation: Integrating AI tooling into content production, community moderation, and documentation.",
            "Applied AI Tooling: Evaluating model capabilities and deploying agentic workflows.",
          ],
        },
        {
          heading: "Pathway 5: Developer & Protocol Engineering (Depend on partnership)",
          body: [
            "Deep dive for technical builders, structured around specific partner ecosystems and protocols. Curriculum and tooling depend on active ecosystem partnerships:",
          ],
          bullets: [
            "Smart Contract Primitives: State management, authorization models, and token standards.",
            "Testing & Local Tooling: Running local testnets, writing unit test suites, and simulating blockchain states.",
            "Frontend Integration: Connecting self-custodial wallets, signing transactions, and reading on-chain data.",
          ],
          callout: {
            type: "important",
            text: "All Skill set Track pathways culminate in a reviewed Capstone Project that is permanently showcased on your verified public portfolio.",
          },
        },
      ],
    },
  },

  // 3. Workshops & Project Reviews
  {
    slug: "workshop-guidelines",
    title: "Workshop Submission Guidelines",
    category: "workshops",
    categoryLabel: "Workshops & Project Reviews",
    summary: "Formatting standards, link verification, and quality checklists for submitting assignment deliverables.",
    readTime: "4 min read",
    updatedAt: "September 2026",
    tags: ["workshops", "assignments", "guidelines", "rubric"],
    keyTakeaways: [
      "Every module has an associated hands-on workshop assignment.",
      "Submissions accept GitHub links, Figma prototypes, deployed URLs, or markdown reports.",
      "Ensure all shared links are public and accessible before submitting.",
    ],
    content: {
      sections: [
        {
          heading: "Acceptable Deliverable Formats",
          body: [
            "Depending on your track, your workshop brief will specify required submission deliverables:",
          ],
          bullets: [
            "Developer Submissions: Public GitHub repository URL. Must include a clear README.md explaining project setup, architecture, and instructions for running tests.",
            "Design Submissions: Public Figma URL with view/comment access enabled, accompanied by high-res exports or case study link.",
            "Growth & Operations Submissions: Shared Google Doc, Notion page, or published Medium/Substack link with public viewing permissions.",
          ],
          callout: {
            type: "warning",
            text: "Private repositories or restricted links will be marked 'Needs Revision'. Double-check your link permissions in an incognito browser window before submitting!",
          },
        },
        {
          heading: "Pre-Submission Quality Checklist",
          body: [
            "Before clicking 'Submit Workshop Assignment', confirm:",
            "✓ Did you satisfy all criteria listed in the workshop brief?",
            "✓ Is your code formatted cleanly with proper comments?",
            "✓ Does your README provide clear attribution and installation instructions?",
            "✓ Have you provided thoughtful reflection on challenges you overcame?",
          ],
        },
      ],
    },
  },
  {
    slug: "mentor-review-process",
    title: "Project Evaluation & Review Rubrics",
    category: "workshops",
    categoryLabel: "Workshops & Project Reviews",
    summary: "How submissions are evaluated, scoring criteria, and actionable revision feedback.",
    readTime: "5 min read",
    updatedAt: "September 2026",
    tags: ["reviews", "grading", "evaluation", "feedback"],
    keyTakeaways: [
      "Every assignment is evaluated against standardized rubrics.",
      "Reviews result in either 'Approved' or 'Needs Revision' with constructive feedback.",
      "Revisions are a normal part of the learning cycle and help you build production-ready skills.",
    ],
    content: {
      sections: [
        {
          heading: "The Submission Review Flow",
          body: [
            "When you submit a workshop, your work enters our review queue where experienced practitioners and instructors evaluate each submission against clear rubrics.",
            "Reviewers examine code cleanliness, architectural correctness, edge-case handling, and clarity of documentation.",
          ],
        },
        {
          heading: "Review Outcomes",
          body: [
            "Within 48 hours of submission, you will receive an in-app notification with one of two statuses:",
          ],
          table: {
            headers: ["Status", "Meaning", "Next Action"],
            rows: [
              [
                "Approved ✓",
                "Submission satisfies all rubric requirements with excellence.",
                "XP awarded; module progress marked 100%; next module unlocked.",
              ],
              [
                "Needs Revision ↺",
                "Submission has minor defects, missing tests, or broken links.",
                "Read reviewer notes, update your project, and click 'Resubmit Assignment'.",
              ],
            ],
          },
          callout: {
            type: "tip",
            text: "Receiving 'Needs Revision' is not a failure. It is the core of practical skill development. Reviewers provide specific feedback so you learn how to produce production-grade deliverables.",
          },
        },
      ],
    },
  },
  {
    slug: "capstone-projects",
    title: "Capstone Project Standards",
    category: "workshops",
    categoryLabel: "Workshops & Project Reviews",
    summary: "Requirements for final graduation capstones, defenses, and showcase presentations.",
    readTime: "5 min read",
    updatedAt: "September 2026",
    tags: ["capstone", "graduation", "showcase", "projects"],
    keyTakeaways: [
      "The Capstone is your final graduation project demonstrating end-to-end track mastery.",
      "Must address a real problem with production-level polish and deployment.",
      "Approved capstones are featured in the Bridge3 Academy Showcase and shared with partner companies.",
    ],
    content: {
      sections: [
        {
          heading: "What is a Capstone Project?",
          body: [
            "The Capstone is the culmination of your journey at Bridge3 Academy. Rather than a contrived classroom exercise, students architect and build a complete, production-grade project.",
            "For engineers, this means a live deployed dApp with smart contracts on testnet. For designers, a comprehensive design system and audited prototype. For operators, a fully executed community growth campaign or funded grant proposal.",
          ],
        },
        {
          heading: "Graduation Defense & Showcase",
          body: [
            "Once submitted, capstones undergo rigorous review by our evaluation committee. Outstanding projects are invited to present live at our monthly Bridge3 Demo Day, broadcast to partner venture funds, DAOs, and ecosystem hiring managers.",
          ],
        },
      ],
    },
  },

  // 4. Gamification & Community
  {
    slug: "xp-and-levels",
    title: "XP System & Student Levels",
    category: "gamification",
    categoryLabel: "Gamification & Community",
    summary: "How experience points (XP) are calculated across lessons, quizzes, assignments, and campus leaderboards.",
    readTime: "3 min read",
    updatedAt: "September 2026",
    tags: ["xp", "gamification", "leaderboard", "levels"],
    keyTakeaways: [
      "XP measures consistency and rigor across the entire platform.",
      "Lessons grant base XP, while passed quizzes and approved assignments grant massive multipliers.",
      "Leaderboards rank students campus-wide and continent-wide.",
    ],
    content: {
      sections: [
        {
          heading: "XP Point Allocation Matrix",
          body: [
            "Bridge3 Academy calculates student XP deterministically based on verified milestones:",
          ],
          table: {
            headers: ["Activity", "XP Awarded", "Condition"],
            rows: [
              ["Lesson Completion", "+10 XP", "Awarded upon reading lesson to completion"],
              ["Quiz Passed (80%+)", "+50 XP", "First passing attempt in a module"],
              ["Quiz Perfect Score (100%)", "+25 Bonus XP", "Answering all questions correctly"],
              ["Workshop Approved", "+150 XP", "Workshop submission approved"],
              ["Capstone Approved", "+500 XP", "Successful capstone graduation defense"],
            ],
          },
        },
        {
          heading: "Student Levels & Titles",
          body: [
            "As your XP accumulates, your profile tier advances from Novice to Fellow:",
            "• Level 1 (0 to 249 XP): Web3 Scholar",
            "• Level 2 (250 to 749 XP): Active Apprentice",
            "• Level 3 (750 to 1,499 XP): Certified Builder",
            "• Level 4 (1,500+ XP): Academy Fellow",
          ],
        },
      ],
    },
  },
  {
    slug: "badges-and-portfolio",
    title: "Skill Badges & Public Portfolio",
    category: "gamification",
    categoryLabel: "Gamification & Community",
    summary: "How to showcase verified accomplishments to employers through your public portfolio URL.",
    readTime: "4 min read",
    updatedAt: "September 2026",
    tags: ["portfolio", "badges", "public-profile", "career"],
    keyTakeaways: [
      "Your public portfolio lives at /portfolio/[studentId] with zero authentication required to view.",
      "Badges represent verifiable milestone achievements such as First Code Shipped or Quiz Master.",
      "Share your portfolio link with recruiters and on social profiles.",
    ],
    content: {
      sections: [
        {
          heading: "Your Digital Proof of Competence",
          body: [
            "Traditional resumes are full of buzzwords that cannot be independently audited. Your Bridge3 Academy Portfolio provides unforgeable evidence of what you have built.",
            "It displays your total earned XP, verified skill badges, links to your approved GitHub repositories, and official certificates.",
          ],
        },
        {
          heading: "Earning Skill Badges",
          body: [
            "Badges are awarded automatically as you reach key platform milestones:",
          ],
          bullets: [
            "🏅 First Step: Complete your very first lesson.",
            "🏅 Quiz Ace: Score 100% on three consecutive module quizzes.",
            "🏅 Builder Initiate: Have your first workshop assignment approved.",
            "🏅 Community Champion: Share constructive feedback and contribute to the community feed.",
            "🏅 Track Graduate: Fulfill 100% of all requirements for an entire track.",
          ],
        },
      ],
    },
  },
  {
    slug: "code-of-conduct",
    title: "Honor Code & Academic Integrity",
    category: "gamification",
    categoryLabel: "Gamification & Community",
    summary: "Standards of academic honesty, anti-plagiarism policies, and respectful community conduct.",
    readTime: "3 min read",
    updatedAt: "September 2026",
    tags: ["honor-code", "conduct", "integrity", "community"],
    keyTakeaways: [
      "Zero tolerance for plagiarized code or submitted answers copied from others.",
      "Community forums must remain respectful, inclusive, and focused on peer support.",
      "Violations result in assignment rejection or permanent account deactivation.",
    ],
    content: {
      sections: [
        {
          heading: "The Bridge3 Honor Code",
          body: [
            "We are dedicated to producing elite African technologists with impeccable ethical standards. Real mastery cannot be forged or shortcutted.",
          ],
          bullets: [
            "Independent Work: All quiz answers and workshop submissions must represent your own authentic effort.",
            "Proper Attribution: If you use third-party libraries or open-source templates, you must clearly cite them in your project documentation.",
            "No Leaking Answers: Sharing quiz answer keys or completed assignment repos in public channels is strictly forbidden.",
            "Respectful Collaboration: Treat instructors, reviewers, and fellow scholars with kindness. Constructive criticism should always build peers up, not tear them down.",
          ],
          callout: {
            type: "warning",
            text: "Our automated verification systems check for authenticity and code integrity. Any student caught submitting cloned repos will forfeit all certificates and may be barred from future academy cohorts.",
          },
        },
      ],
    },
  },

  // 5. Certification & Standards
  {
    slug: "certification-standards",
    title: "Certification Standards & Issuance",
    category: "certification",
    categoryLabel: "Certification & Standards",
    summary: "The strict requirements needed to unlock and claim an official Bridge3 Academy Certificate of Completion.",
    readTime: "4 min read",
    updatedAt: "September 2026",
    tags: ["certificates", "standards", "completion", "verification"],
    keyTakeaways: [
      "Certificates are earned through complete track fulfillment: 100% completion across all modules is mandatory.",
      "Issuance is guarded by single-source-of-truth server logic.",
      "Each certificate receives a unique ID (B3A-YYYY-XXXXXX) and a tamper-proof SHA-256 hash.",
    ],
    content: {
      sections: [
        {
          heading: "The Four Graduation Requirements",
          body: [
            "To unlock the 'Claim Certificate' button on your Certification Dashboard, your student profile must satisfy all four criteria:",
          ],
          bullets: [
            "1. 100% Lessons Completed: Every lesson in every module of the track marked finished.",
            "2. 100% Quizzes Passed: Every module quiz passed with a score of 80% or higher.",
            "3. 100% Assignments Approved: Every workshop assignment reviewed and approved.",
            "4. Capstone Defense Approved: If the track requires a capstone, it must be successfully defended and marked approved.",
          ],
          callout: {
            type: "important",
            text: "There are no exceptions or partial certificates. This strict standard is what gives Bridge3 Academy credentials authentic prestige with international Web3 employers.",
          },
        },
        {
          heading: "Issuance & Storage",
          body: [
            "When you claim your certificate, the issuance endpoint verifies your progress directly against Postgres database records using the service role key. It generates a human-friendly Certificate ID and binds it with a permanent SHA-256 cryptographic verification hash.",
          ],
        },
      ],
    },
  },
  {
    slug: "cryptographic-verification",
    title: "Cryptographic Verification Engine",
    category: "certification",
    categoryLabel: "Certification & Standards",
    summary: "How SHA-256 verification hashes guarantee certificate authenticity without relying on paper or unverified PDFs.",
    readTime: "5 min read",
    updatedAt: "September 2026",
    tags: ["cryptography", "sha256", "hash", "verification"],
    keyTakeaways: [
      "Every certificate is bound to a SHA-256 verification hash: bridge3:studentId:trackId:certNum:timestamp.",
      "Anyone can verify a certificate at /certificates/[id] without logging in.",
      "Includes gold seal, printable landscape layout, and social share links.",
    ],
    content: {
      sections: [
        {
          heading: "How Tamper-Proof Hashing Works",
          body: [
            "Traditional digital certificates are easily forged using image editors. At Bridge3 Academy, every certificate is cryptographically bound to its recipient and completion metadata at the moment of issuance:",
          ],
          codeBlock: {
            language: "typescript",
            code: `// Verification hash generation in lib/certificates/adapter.ts
export function generateVerificationHash(
  studentId: string,
  trackId: string,
  certificateNumber: string,
  issuedAt: string
): string {
  const payload = \`bridge3:\${studentId}:\${trackId}:\${certificateNumber}:\${issuedAt}\`;
  return crypto.createHash("sha256").update(payload).digest("hex");
}`,
          },
        },
        {
          heading: "Public Verification Portal",
          body: [
            "Every certificate has a dedicated public verification page at /certificates/[id]. Anyone, including an employer, a university registrar, or a hackathon organizer, can open the URL to inspect:",
            "• Student's full name and profile avatar.",
            "• Track title, description, and completion timestamp.",
            "• Precise competencies verified (lessons completed, quizzes passed, assignments approved).",
            "• Cryptographic verification hash confirming authenticity.",
          ],
        },
      ],
    },
  },
  {
    slug: "on-chain-future",
    title: "Future On-Chain Credentials & Multi-Chain Vision",
    category: "certification",
    categoryLabel: "Certification & Standards",
    summary: "How Bridge3 Academy will anchor verified certificates into on-chain Soulbound NFTs across blockchain networks.",
    readTime: "4 min read",
    updatedAt: "September 2026",
    tags: ["on-chain", "nfts", "multi-chain", "soulbound"],
    keyTakeaways: [
      "Bridge3 Academy uses an extensible adapter pattern (CertificateAdapter) designed for multi-chain portability.",
      "Future upgrades will allow scholars to mint their credentials as Soulbound NFTs.",
      "Scholars will own their credentials permanently in self-custodial Web3 wallets.",
    ],
    content: {
      sections: [
        {
          heading: "The Multi-Chain Credential Architecture",
          body: [
            "While our verification engine provides immediate cryptographic security off-chain, our platform architecture is built around the CertificateAdapter interface in lib/certificates/adapter.ts.",
            "This abstraction decouples certificate issuance logic from underlying storage. When we activate on-chain minting, your credentials can be anchored directly to Bitcoin Layer 2 (Stacks SIP-009) or Ethereum Layer 2s (EVM ERC-721/ERC-1155) without modifying student data or breaking existing verification links.",
          ],
        },
        {
          heading: "Soulbound Tokens (Non-Transferable NFTs)",
          body: [
            "Academic credentials must reflect the individual who performed the work. Future on-chain certificates will be minted as Soulbound tokens: non-transferable credentials that are permanently bound to your Web3 wallet address and cannot be transferred, sold, or stolen.",
          ],
        },
      ],
    },
  },
];

// Utility functions
export function getAllArticles(): DocArticle[] {
  return DOC_ARTICLES;
}

export function getArticleBySlug(slug: string): DocArticle | undefined {
  return DOC_ARTICLES.find((a) => a.slug === slug);
}

export function getArticlesByCategory(categoryId: DocCategory["id"]): DocArticle[] {
  return DOC_ARTICLES.filter((a) => a.category === categoryId);
}

export function searchArticles(query: string): DocArticle[] {
  const clean = query.trim().toLowerCase();
  if (!clean) return DOC_ARTICLES;

  return DOC_ARTICLES.filter((article) => {
    return (
      article.title.toLowerCase().includes(clean) ||
      article.summary.toLowerCase().includes(clean) ||
      article.categoryLabel.toLowerCase().includes(clean) ||
      article.tags.some((t) => t.toLowerCase().includes(clean))
    );
  });
}

export function getAdjacentArticles(currentSlug: string): {
  prev?: { slug: string; title: string };
  next?: { slug: string; title: string };
} {
  const index = DOC_ARTICLES.findIndex((a) => a.slug === currentSlug);
  if (index === -1) return {};

  return {
    prev: index > 0 ? { slug: DOC_ARTICLES[index - 1].slug, title: DOC_ARTICLES[index - 1].title } : undefined,
    next:
      index < DOC_ARTICLES.length - 1
        ? { slug: DOC_ARTICLES[index + 1].slug, title: DOC_ARTICLES[index + 1].title }
        : undefined,
  };
}
