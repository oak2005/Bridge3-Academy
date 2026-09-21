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
    label: "Curriculum & Tracks",
    description: "Detailed syllabus breakdown across General, Ecosystem, Developer, Creative, and Growth tracks.",
    icon: "📚",
  },
  {
    id: "workshops",
    label: "Workshops & Mentorship",
    description: "Project submission guidelines, peer reviews, mentor grading rubrics, and capstone milestones.",
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
    summary: "An introduction to Bridge3 Academy, our mission for African talent, and how our structured LMS empowers builders.",
    readTime: "3 min read",
    updatedAt: "September 2026",
    tags: ["introduction", "mission", "africa", "web3"],
    keyTakeaways: [
      "Bridge3 Academy solves tutorial fragmentation with structured, mentor-reviewed learning paths.",
      "Designed specifically for ambitious African students, developers, designers, and operators.",
      "Every milestone is verified through server-graded quizzes, hands-on workshops, and tamper-proof certificates.",
    ],
    content: {
      sections: [
        {
          heading: "The Bridge to Web3 in Africa",
          body: [
            "Across Africa, millions of brilliant students and builders are eager to participate in the decentralized global economy. However, traditional education systems lack Web3 curriculum, while online learning is plagued by chaotic YouTube playlists, outdated tutorials, and unverified promises.",
            "Bridge3 Academy was built to replace tutorial chaos with a structured, collegiate-grade learning experience tailored to African university students and emerging builders. We take you from zero foundational knowledge to production-ready Web3 competence.",
          ],
          callout: {
            type: "note",
            text: "Bridge3 Academy is 100% free for students. Our platform is backed by ecosystem partners committed to open public goods education.",
          },
        },
        {
          heading: "Our Core Pedagogical Philosophy",
          body: [
            "We believe true mastery requires more than watching videos. Bridge3 Academy operates on a four-pillar pedagogical framework:",
          ],
          bullets: [
            "Structured Theory: Bite-sized, progressive lessons that demystify complex consensus, cryptographic, and economic primitives.",
            "Server-Graded Assessments: Automated quizzes that rigorously test comprehension before permitting module progression.",
            "Practical Workshop Submissions: Real code, Figma designs, and growth proposals submitted for review.",
            "Human Mentorship: Senior ecosystem builders who evaluate your assignments, give actionable feedback, and approve your milestones.",
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
      "Authentication uses Google OAuth — no passwords to remember or lose.",
      "Onboarding captures your university, role interests, and primary specialization track.",
      "You can adjust your profile preferences anytime from Account & Settings.",
    ],
    content: {
      sections: [
        {
          heading: "Step 1: One-Click Authentication",
          body: [
            "Bridge3 Academy utilizes Google OAuth for secure, frictionless authentication. We deliberately do not store passwords, eliminating credential theft vulnerabilities.",
            "Simply click 'Login' or 'Get Started' from the homepage and authorize with your personal or university Google account.",
          ],
          callout: {
            type: "tip",
            text: "Use the Google account you check regularly so you don't miss mentor review feedback and live event notifications.",
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
            "Specialization Track: Select your primary focus area — Engineering, Creative & Design, Community & Growth, or Operations.",
          ],
        },
        {
          heading: "Step 3: Navigating Your Dashboard",
          body: [
            "Once onboarded, your dashboard becomes your daily learning headquarters. From the left sidebar, you can navigate:",
            "• Dashboard: Overview of today's recommended lesson, overall track progress, and upcoming community workshops.",
            "• My Courses: Complete module syllabus with lesson-by-lesson progress tracking.",
            "• Workshops: Interactive coding and design challenges requiring hands-on submissions.",
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
    summary: "How lessons, quizzes, workshop assignments, and mentor reviews connect to build genuine mastery.",
    readTime: "5 min read",
    updatedAt: "September 2026",
    tags: ["workflow", "classroom", "quizzes", "workshops"],
    keyTakeaways: [
      "Each module follows a 4-step cadence: Study → Quiz → Build → Review.",
      "Quizzes test recall with an 80% passing threshold and immediate server feedback.",
      "Workshops require building real artifacts reviewed by human mentors.",
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
              ["3. Build", "Complete practical workshop assignment", "Submit GitHub repo or live link", "Submitted to Mentor Review queue"],
              ["4. Review", "Mentor inspects submission against rubric", "Mentor approval", "Module 100% complete; badge awarded"],
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

  // 2. Curriculum & Tracks
  {
    slug: "curriculum-overview",
    title: "Curriculum Architecture & Philosophy",
    category: "curriculum",
    categoryLabel: "Curriculum & Tracks",
    summary: "An overview of how our curriculum is structured across foundational, ecosystem, and specialized skill tracks.",
    readTime: "4 min read",
    updatedAt: "September 2026",
    tags: ["curriculum", "tracks", "syllabus", "overview"],
    keyTakeaways: [
      "The General Track is mandatory for all students to build ironclad Bitcoin & Web3 fundamentals.",
      "Ecosystem Support Track prepares students for community management and DAO governance.",
      "Specialization tracks offer focused pathways for Developers, Creators, and Growth operators.",
    ],
    content: {
      sections: [
        {
          heading: "Three-Tier Educational Hierarchy",
          body: [
            "The Bridge3 Academy curriculum is organized into three distinct tiers:",
            "1. Tier 1: General Track (Foundations) — Required for all scholars. Establishes core cryptographic principles, decentralized consensus, Bitcoin, and wallet security.",
            "2. Tier 2: Ecosystem Support Track — Bridges theory to real decentralized protocols, covering tokenomics, DAO governance, and developer relations.",
            "3. Tier 3: Specialized Skill Tracks — Hands-on, career-focused mastery in Engineering, Design, or Growth.",
          ],
        },
        {
          heading: "Built for the African Job Market",
          body: [
            "Web3 companies hire remotely across global time zones. Our curriculum is tailored to prepare African youth for remote junior developer roles, technical community management, Web3 graphic design, and ecosystem operations.",
            "Every assignment simulates real deliverables expected by leading decentralized protocols and venture-backed startups.",
          ],
          callout: {
            type: "tip",
            text: "You can study multiple tracks sequentially! Many successful scholars complete the General Track first, then pursue both Engineering and Growth tracks.",
          },
        },
      ],
    },
  },
  {
    slug: "track-general",
    title: "General Track: Web3 & Bitcoin Foundations",
    category: "curriculum",
    categoryLabel: "Curriculum & Tracks",
    summary: "Foundational syllabus covering Bitcoin, Proof of Work, cryptographic hashing, wallets, and smart contract primitives.",
    readTime: "5 min read",
    updatedAt: "September 2026",
    tags: ["general", "bitcoin", "cryptography", "foundations"],
    keyTakeaways: [
      "Demystifies Byzantine Fault Tolerance and Satoshi Nakamoto's breakthrough.",
      "Covers public/private key cryptography, mnemonic seed phrases, and self-custody.",
      "Explores Layer 1 vs. Layer 2 scaling architectures.",
    ],
    content: {
      sections: [
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
    slug: "track-developer",
    title: "Developer Track: Smart Contracts & Layer 2",
    category: "curriculum",
    categoryLabel: "Curriculum & Tracks",
    summary: "Deep dive for software engineers building decentralized applications, smart contracts, and Web3 frontends.",
    readTime: "6 min read",
    updatedAt: "September 2026",
    tags: ["developer", "clarity", "smart-contracts", "coding"],
    keyTakeaways: [
      "Master decidable smart contract programming with Clarity on Bitcoin Layer 2.",
      "Write automated unit tests using Clarinet and TypeScript.",
      "Integrate Web3 wallets and interact with smart contracts from Next.js frontends.",
    ],
    content: {
      sections: [
        {
          heading: "Why Clarity & Decidable Contracts?",
          body: [
            "Unlike Solidity on the EVM which is Turing-complete and prone to reentrancy attacks, Clarity is a decidable, interpreted smart contract language. You can mathematically verify gas execution and state transitions before a transaction executes.",
          ],
          codeBlock: {
            language: "clarity",
            code: `;; Sample Clarity smart contract function
(define-public (mint-credential (recipient principal) (token-id uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) (err u100))
    (nft-mint? bridge3-cert token-id recipient)
  )
)`,
          },
        },
        {
          heading: "Developer Track Syllabus",
          body: [
            "The engineering curriculum is project-intensive from Day 1:",
          ],
          bullets: [
            "Clarity Primitives: Data types, maps, variables, error handling, and authorization traits.",
            "Local Development: Installing Clarinet, writing unit test suites, and simulating blockchain states.",
            "DeFi & Token Standards: Fungible tokens (SIP-010) and Non-Fungible tokens (SIP-009).",
            "Frontend Web3 Integration: Connecting wallets, signing transactions, and reading on-chain states in React/Next.js.",
            "Production Security: Static analysis, auditing common pitfalls, and deploying to testnet.",
          ],
          callout: {
            type: "important",
            text: "All code submissions must be submitted as public GitHub repositories with README documentation and automated test suites.",
          },
        },
      ],
    },
  },
  {
    slug: "track-creative",
    title: "Creative & Design Track: Web3 UX/UI",
    category: "curriculum",
    categoryLabel: "Curriculum & Tracks",
    summary: "For visual designers, UX researchers, and brand strategists creating intuitive decentralized interfaces.",
    readTime: "4 min read",
    updatedAt: "September 2026",
    tags: ["design", "ui/ux", "figma", "creative"],
    keyTakeaways: [
      "Design user experiences that abstract away complex blockchain jargon.",
      "Master wallet connection flows, transaction pending states, and error recovery.",
      "Create high-fidelity design systems and interactive Figma prototypes.",
    ],
    content: {
      sections: [
        {
          heading: "The Web3 UX Crisis",
          body: [
            "The greatest barrier to mainstream Web3 adoption isn't technology — it's terrible user experience. Cryptic hex addresses, confusing gas estimations, and terrifying signature popups alienate everyday users.",
            "Our Creative & Design Track trains African designers to build user-friendly Web3 products that feel as smooth and welcoming as modern consumer apps.",
          ],
        },
        {
          heading: "What You Learn to Design",
          body: [
            "Scholars build a comprehensive design portfolio covering:",
          ],
          bullets: [
            "Human-Centric Web3 Design: Progressive onboarding, gasless meta-transactions, and seed phrase recovery UX.",
            "Figma Component Systems: Accessible color palettes, dark/light themes, typography, and state machines.",
            "Transaction Feedback Design: Pending, confirmed, and reverted state animations.",
            "Community Branding & Storytelling: Creating compelling visual identities for DAOs and protocols.",
          ],
        },
      ],
    },
  },
  {
    slug: "track-growth",
    title: "Growth & Operations Track: Ecosystem Expansion",
    category: "curriculum",
    categoryLabel: "Curriculum & Tracks",
    summary: "Curriculum for community managers, technical writers, growth hackers, and DAO operations leaders.",
    readTime: "4 min read",
    updatedAt: "September 2026",
    tags: ["growth", "community", "marketing", "operations"],
    keyTakeaways: [
      "Learn to organize hackathons, campus meetups, and developer workshops.",
      "Write technical documentation, ecosystem grant applications, and research reports.",
      "Master decentralized community management on Discord, Telegram, and X.",
    ],
    content: {
      sections: [
        {
          heading: "Powering Decentralized Ecosystems",
          body: [
            "Decentralized protocols cannot succeed without energetic community leaders, skilled technical writers, and operations specialists who coordinate contributors across the globe.",
            "The Growth & Operations track equips students with professional strategies to manage developer relations, write competitive ecosystem grant proposals, and scale community engagement.",
          ],
        },
        {
          heading: "Key Practical Projects",
          body: [
            "Students complete hands-on assignments including:",
          ],
          bullets: [
            "Ecosystem Grant Proposal: Research a real protocol need and draft a formal milestone grant application.",
            "Technical Documentation & Tutorials: Write clear developer guides explaining how to interact with a protocol.",
            "Campus Meetup Playbook: Plan an in-person university Web3 workshop complete with budget, agenda, and promotional campaign.",
            "Community Engagement Strategy: Manage community moderation, host live X Spaces, and resolve user issues.",
          ],
        },
      ],
    },
  },

  // 3. Workshops & Mentorship
  {
    slug: "workshop-guidelines",
    title: "Workshop Submission Guidelines",
    category: "workshops",
    categoryLabel: "Workshops & Mentorship",
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
            text: "Private repositories or restricted links will be immediately marked 'Needs Revision' by mentors. Double-check your link permissions in an incognito browser window before submitting!",
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
    title: "Mentor Grading & Review Rubrics",
    category: "workshops",
    categoryLabel: "Workshops & Mentorship",
    summary: "How mentors evaluate your submissions, score criteria, and provide actionable revision feedback.",
    readTime: "5 min read",
    updatedAt: "September 2026",
    tags: ["mentors", "grading", "reviews", "feedback"],
    keyTakeaways: [
      "Every assignment is reviewed by a qualified human mentor.",
      "Reviews result in either 'Approved' or 'Needs Revision' with constructive feedback.",
      "Revisions are a normal part of the learning cycle — never a failure.",
    ],
    content: {
      sections: [
        {
          heading: "The Mentor Queue & Review Flow",
          body: [
            "When you submit a workshop, your work enters the Mentor Review Queue (`/dashboard/mentor`). Our network of senior ecosystem builders inspects each submission against standardized scoring rubrics.",
            "Mentors examine code cleanliness, architectural correctness, edge-case handling, and clarity of documentation.",
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
                "Read mentor notes, update your project, and click 'Resubmit Assignment'.",
              ],
            ],
          },
          callout: {
            type: "tip",
            text: "Receiving 'Needs Revision' is not a failure — it is the core of real engineering apprenticeship. Mentors provide specific line-by-line feedback so you learn how to write production-grade deliverables.",
          },
        },
      ],
    },
  },
  {
    slug: "capstone-projects",
    title: "Capstone Project Standards",
    category: "workshops",
    categoryLabel: "Workshops & Mentorship",
    summary: "Requirements for final graduation capstones, mentor defenses, and showcase presentations.",
    readTime: "5 min read",
    updatedAt: "September 2026",
    tags: ["capstone", "graduation", "showcase", "projects"],
    keyTakeaways: [
      "The Capstone is your final graduation project demonstrating end-to-end track mastery.",
      "Must address a real problem with production-level Polish and deployment.",
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
            "Once submitted, capstones undergo rigorous review by a panel of two mentors. Outstanding projects are invited to present live at our monthly Bridge3 Demo Day, broadcast to partner venture funds, DAOs, and ecosystem hiring managers.",
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
              ["Workshop Approved", "+150 XP", "Mentor approves workshop submission"],
              ["Capstone Approved", "+500 XP", "Successful capstone graduation defense"],
            ],
          },
        },
        {
          heading: "Student Levels & Titles",
          body: [
            "As your XP accumulates, your profile tier advances from Novice to Fellow:",
            "• Level 1 (0 – 249 XP): Web3 Scholar",
            "• Level 2 (250 – 749 XP): Active Apprentice",
            "• Level 3 (750 – 1,499 XP): Certified Builder",
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
      "Your public portfolio lives at `/portfolio/[studentId]` with zero authentication required to view.",
      "Badges represent verifiable milestone achievements (e.g., First Code Shipped, Quiz Master).",
      "Share your portfolio link with recruiters and on social profiles.",
    ],
    content: {
      sections: [
        {
          heading: "Your Digital Proof of Competence",
          body: [
            "Traditional resumes are full of buzzwords that cannot be independently audited. Your Bridge3 Academy Portfolio (`/portfolio/[studentId]`) provides unforgeable evidence of what you have built.",
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
            "🏅 Builder Initiate: Have your first workshop assignment approved by a mentor.",
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
            "Respectful Collaboration: Treat mentors and fellow scholars with kindness. Constructive criticism should always build peers up, not tear them down.",
          ],
          callout: {
            type: "warning",
            text: "Our admin mission control tracks automated plagiarism checks. Any student caught submitting cloned repos will forfeit all certificates and may be barred from future academy cohorts.",
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
      "Certificates are earned, never gifted — 100% completion across all modules is mandatory.",
      "Issuance is guarded by single-source-of-truth server logic (`trackCompletion.ts`).",
      "Each certificate receives a unique ID (`B3A-YYYY-XXXXXX`) and a tamper-proof SHA-256 hash.",
    ],
    content: {
      sections: [
        {
          heading: "The Four Graduation Requirements",
          body: [
            "To unlock the 'Claim Certificate' button on your Certification Dashboard (`/dashboard/certification`), your student profile must satisfy all four criteria:",
          ],
          bullets: [
            "1. 100% Lessons Completed: Every lesson in every module of the track marked finished.",
            "2. 100% Quizzes Passed: Every module quiz passed with a score of 80% or higher.",
            "3. 100% Assignments Approved: Every workshop assignment reviewed and approved by a mentor.",
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
            "When you claim your certificate, the issuance endpoint (`/api/certificates/issue`) verifies your progress directly against Postgres database records using the service role key. It generates a human-friendly Certificate ID and binds it with a permanent SHA-256 cryptographic verification hash.",
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
      "Every certificate is bound to a SHA-256 verification hash: `bridge3:studentId:trackId:certNum:timestamp`.",
      "Anyone can verify a certificate at `/certificates/[id]` without logging in.",
      "Includes gold seal, printable landscape layout, and social share links.",
    ],
    content: {
      sections: [
        {
          heading: "How Tamper-Proof Hashing Works",
          body: [
            "Traditional digital certificates are easily forged using Photoshop. At Bridge3 Academy, every certificate is cryptographically bound to its recipient and completion metadata at the moment of issuance:",
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
            "Every certificate has a dedicated public verification page at `/certificates/[id]`. Anyone — an employer, a university registrar, or a hackathon organizer — can open the URL to inspect:",
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
      "Bridge3 Academy uses an extensible adapter pattern (`CertificateAdapter`) designed for multi-chain portability.",
      "Future upgrades will allow scholars to mint their credentials as Soulbound NFTs.",
      "Scholars will own their credentials permanently in self-custodial Web3 wallets.",
    ],
    content: {
      sections: [
        {
          heading: "The Multi-Chain Credential Architecture",
          body: [
            "While our Phase 12 verification engine provides immediate cryptographic security off-chain, our platform architecture is built around the `CertificateAdapter` interface in `lib/certificates/adapter.ts`.",
            "This abstraction decouples certificate issuance logic from underlying storage. When we activate on-chain minting, your credentials can be anchored directly to Bitcoin Layer 2 (Stacks SIP-009) or Ethereum Layer 2s (EVM ERC-721/ERC-1155) without modifying student data or breaking existing verification links.",
          ],
        },
        {
          heading: "Soulbound Tokens (Non-Transferable NFTs)",
          body: [
            "Academic credentials must reflect the individual who performed the work. Future on-chain certificates will be minted as Soulbound tokens — NFTs that are permanently bound to your Web3 wallet address and cannot be transferred, sold, or stolen.",
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
