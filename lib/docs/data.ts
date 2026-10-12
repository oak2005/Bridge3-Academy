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
    description: "Detailed syllabus breakdown across our 3 tracks: General, Ecosystem Support, and Skill Set Track.",
    icon: "📚",
  },
  {
    id: "workshops",
    label: "Workshops & Project Reviews",
    description: "Project submission guidelines, peer reviews, mentor evaluation, and capstone requirements.",
    icon: "🛠️",
  },
  {
    id: "gamification",
    label: "Gamification & Community",
    description: "Earning XP, unlocking milestone badges, platform leaderboard, and your private public portfolio.",
    icon: "🏆",
  },
  {
    id: "certification",
    label: "Certification & Standards",
    description: "Graduation criteria, public verification links, and our future on-chain credential roadmap.",
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
    summary: "An introduction to Bridge3 Academy, our guided learning path for students across Africa, and how to get started.",
    readTime: "3 min read",
    updatedAt: "October 2026",
    tags: ["welcome", "introduction", "mission", "africa", "web3"],
    keyTakeaways: [
      "Bridge3 Academy is a free, structured Web3 education platform for students across Africa.",
      "Follow one guided path: lessons, quizzes, hands-on assignments, and mentor-reviewed capstones.",
      "Sign in with Google — no separate password, no other sign-in method right now.",
    ],
    content: {
      sections: [
        {
          heading: "The Guided Path to Web3 in Africa",
          body: [
            "Bridge3 Academy is a free, structured Web3 education platform for students across Africa. Instead of piecing together scattered YouTube videos, Telegram chats, and random threads, you follow one guided path: lessons, quizzes, hands-on assignments, and (for tracks that require it) a capstone project — reviewed by real mentors, not just auto-graded.",
            "Across Africa, ambitious students and emerging builders are eager to participate in the decentralized global economy. Bridge3 Academy provides the structured foundation and practical proof of work needed to transition from curious beginner to confident contributor.",
          ],
          callout: {
            type: "note",
            text: "Bridge3 Academy is 100% free for students. Sponsoring partners support cohorts to reach students at the exact moment they are learning the habits and tools they will use for years.",
          },
        },
        {
          heading: "Simple, Frictionless Access",
          body: [
            "Sign in with Google. There is no separate password and no other sign-in method right now. One click connects you directly to your personalized learning headquarters.",
          ],
        },
        {
          heading: "What You Will Achieve",
          body: [
            "Upon completing your curriculum track, you will possess concrete proof of competence:",
          ],
          bullets: [
            "A shareable public portfolio showcasing your approved assignments, XP, and badges.",
            "An official Certificate of Completion with a unique verification code checkable by anyone.",
            "Practical skills and direct experience ready for hackathons, bounties, and remote opportunities.",
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
    summary: "Step-by-step onboarding walkthrough from Google sign-in to profile personalization and dashboard navigation.",
    readTime: "3 min read",
    updatedAt: "October 2026",
    tags: ["onboarding", "google-auth", "profile", "journey"],
    keyTakeaways: [
      "Sign in with Google with zero password friction.",
      "First-time profile setup captures your university and role interest.",
      "Personalize your path by selecting your current level and track focus.",
      "Dashboard displays real progress, upcoming milestones, and your next lesson.",
    ],
    content: {
      sections: [
        {
          heading: "The 4-Step Onboarding Flow",
          body: [
            "Getting started on Bridge3 Academy takes less than two minutes. The onboarding flow ensures your curriculum and dashboard reflect your background and goals:",
          ],
          bullets: [
            "1. Sign in with Google: Quick, passwordless authentication using your authorized Google account.",
            "2. First time only: Tell us your university and what you're most interested in (Developer, Growth, Creative, or Operations) — Google doesn't share this with us.",
            "3. Personalize your path: Pick your current level (Beginner/Intermediate/Advanced) and a track focus (Growth, Creative, Operations, or Engineering).",
            "4. Land on your dashboard: Enter your learning headquarters, showing your real progress and your next lesson.",
          ],
          callout: {
            type: "tip",
            text: "Use the Google account you check regularly so you don't miss reviewer feedback on your workshop assignments.",
          },
        },
        {
          heading: "Navigating Your Learning Headquarters",
          body: [
            "From your dashboard, you have quick access to every part of the academy:",
          ],
          bullets: [
            "Dashboard: View your overall track progress, next recommended lesson, and recent notifications.",
            "My Courses: Complete module syllabus with lesson-by-lesson progress tracking.",
            "Workshops: Submit hands-on assignments and receive written mentor reviews.",
            "Assessments: Take module quizzes and work on capstone deliverables.",
            "Portfolio: View and share your unlisted public profile with earned XP and badges.",
            "Certification: Track graduation requirements and claim your certificate when eligible.",
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
    summary: "How lessons, server-graded quizzes, hands-on workshop assignments, and mentor reviews connect to form our complete learning cycle.",
    readTime: "4 min read",
    updatedAt: "October 2026",
    tags: ["workflow", "lessons", "quizzes", "assignments", "certification"],
    keyTakeaways: [
      "Each module follows a structured cadence: lesson notes/video → instant quiz → practical assignment → mentor feedback.",
      "Quizzes are graded instantly on the server with immediate score and passing status.",
      "Audio playback is currently a planned feature, not a live option.",
      "Complete all lessons, quizzes, assignments, and capstones to unlock your certificate.",
    ],
    content: {
      sections: [
        {
          heading: "The Module Learning Cadence",
          body: [
            "Every module in Bridge3 Academy follows an integrated pedagogical flow designed to turn concepts into verified competence:",
            "For each module in a track:",
          ],
          bullets: [
            "Watch the lesson video (when one is attached) and read the lesson notes.",
            "Mark it complete to log your progress.",
            "If the module has a quiz, take it (graded instantly, server-side — you'll see your score and whether you passed).",
            "If the module has an assignment, submit it (text and/or a file) and wait for mentor feedback.",
          ],
          callout: {
            type: "note",
            text: "Feature clarification: There is currently no 'listen to audio' option on lesson pages. That is a planned roadmap feature, not a live one — audio playback will be introduced once the feature is fully built.",
          },
        },
        {
          heading: "Completing a Track & Claiming Certification",
          body: [
            "Once every lesson, quiz, and assignment in a track is done — and the capstone too, for tracks that require one — the track is complete and you can claim your certificate from the Certification page.",
            "Progress is recorded server-side in real time, so you can learn at your own pace without losing momentum.",
          ],
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
    summary: "Overview of the three curriculum tracks: General Track, Ecosystem Support Track, and Skill Set Track.",
    readTime: "4 min read",
    updatedAt: "October 2026",
    tags: ["curriculum", "tracks", "general", "ecosystem", "skillset"],
    keyTakeaways: [
      "General Track is the starting point for everyone: Bitcoin, Web3, blockchain fundamentals, and practical usage.",
      "Ecosystem Support Track explores decentralized application mechanics and ecosystem infrastructure.",
      "Skill Set Track offers career specializations in Design, Creation, Community & Growth, with Builder coming soon.",
    ],
    content: {
      sections: [
        {
          heading: "Three Core Curriculum Tracks",
          body: [
            "Bridge3 Academy organizes learning across three distinct kinds of tracks:",
          ],
          bullets: [
            "General Track — The starting point for everyone: Bitcoin, Web3, blockchain fundamentals, then practical usage (wallets, security, real-world application).",
            "Ecosystem Support Track — How blockchain ecosystems actually work, how decentralized applications operate.",
            "Skill Set Track — Choose a specialization: Designer, Creator, Community & Growth, or Builder (Builder is a planned partnership, not open for enrollment yet — we say so honestly rather than hide it).",
          ],
        },
        {
          heading: "Curriculum Philosophy",
          body: [
            "We believe that real mastery comes from hands-on application rather than passive viewing. Our curriculum is tailored for the African context, providing actionable knowledge and verified deliverables that translate into real digital opportunities.",
          ],
          callout: {
            type: "tip",
            text: "All students begin with the General Track to establish foundational literacy before moving into ecosystem infrastructure and career specializations.",
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
    summary: "Detailed breakdown of Level 1 Foundations and Level 2 Practical Usage, quizzes, assignments, and capstone requirements.",
    readTime: "4 min read",
    updatedAt: "October 2026",
    tags: ["general-track", "bitcoin", "blockchain", "wallets", "capstone"],
    keyTakeaways: [
      "Level 1 covers blockchain theory, Bitcoin basics, and smart contracts with a 3-question quiz (100% required to pass at 70% threshold).",
      "Level 2 covers wallet security and dApp navigation with two practical assignments.",
      "The General Track requires an approved capstone project to be marked complete.",
    ],
    content: {
      sections: [
        {
          heading: "What the General Track Covers",
          body: [
            "The General Track is the foundational starting point for all scholars. It moves you from zero previous knowledge to confident, safe navigation of decentralized systems, Bitcoin mechanics, and digital custody.",
          ],
        },
        {
          heading: "Level 1 — Foundations",
          body: [
            "Level 1 introduces core blockchain architecture across 3 lessons and 1 quiz:",
          ],
          bullets: [
            "Lesson 1: What is Blockchain?",
            "Lesson 2: Bitcoin Basics",
            "Lesson 3: Smart Contracts 101",
            "Level 1 Quiz: 3 questions, 70% passing score — note that with only 3 questions, you need all 3 correct to pass (2 out of 3 rounds to 67%, just under the threshold).",
          ],
          callout: {
            type: "important",
            text: "Take your time on the Level 1 Quiz: because the quiz contains 3 questions with a 70% passing threshold, answering 2 correctly yields 66.7%, which does not pass. All 3 correct answers are required.",
          },
        },
        {
          heading: "Level 2 — Practical Usage",
          body: [
            "Level 2 bridges conceptual understanding into hands-on execution across 2 lessons and 2 assignments:",
          ],
          bullets: [
            "Lesson 1: Setting Up a Wallet Safely",
            "Lesson 2: Navigating a dApp",
            "Assignment 1: 'Reflect on What You Learned' — reviewed by a mentor.",
            "Assignment 2: 'Set Up Your Wallet' — reviewed by a mentor.",
          ],
        },
        {
          heading: "Capstone Requirement",
          body: [
            "This track requires a capstone project to be marked complete. You must submit a completed capstone deliverable and receive mentor approval before claiming your General Track certificate.",
          ],
        },
      ],
    },
  },
  {
    slug: "track-ecosystem",
    title: "Ecosystem Support Track: Protocol Integration",
    category: "curriculum",
    categoryLabel: "Curriculum",
    summary: "How blockchain ecosystems operate, decentralized applications, and our architecture for future sponsor-branded tracks.",
    readTime: "3 min read",
    updatedAt: "October 2026",
    tags: ["ecosystem", "protocols", "infrastructure", "sponsorship"],
    keyTakeaways: [
      "Current curriculum covers 'How Ecosystems Work' — dApp fundamentals and ecosystem infrastructure.",
      "The platform is architected to host future sponsor-branded content.",
      "No sponsor content or 'Partner Challenges' exist yet — they will launch alongside official protocol partnerships.",
    ],
    content: {
      sections: [
        {
          heading: "How Ecosystems Work",
          body: [
            "The Ecosystem Support Track explores how decentralized networks operate as coordinated ecosystems of protocols, developers, validators, and decentralized applications (dApps).",
            "Current live content focuses on 'How Ecosystems Work' — covering decentralized application fundamentals and ecosystem infrastructure basics.",
          ],
        },
        {
          heading: "Future Sponsor-Branded Tracks",
          body: [
            "This track is intentionally designed to host future sponsor-branded content. The Bridge3 Academy platform architecture already supports flagging a track or module as sponsor-specific, enabling protocol partners to bring curriculum and developer tooling directly to students.",
            "Clarification on current availability: No sponsor content exists yet. While the underlying system is built for partner challenges, we do not describe 'Partner Challenges' as something students can do today. They will launch as official protocol sponsorships go live.",
          ],
          callout: {
            type: "note",
            text: "For ecosystem partners: sponsoring a cohort means reaching students at the exact moment they are learning the tools and frameworks they will build with for years.",
          },
        },
      ],
    },
  },
  {
    slug: "track-skillset",
    title: "Skill Set Track: Career Specializations",
    category: "curriculum",
    categoryLabel: "Curriculum",
    summary: "Career specializations for high-demand digital and Web3 roles: Designer, Creator, Community & Growth, and Builder (coming soon).",
    readTime: "4 min read",
    updatedAt: "October 2026",
    tags: ["skillset", "designer", "creator", "community", "builder"],
    keyTakeaways: [
      "Four distinct career specializations tailored to the global digital economy.",
      "Designer, Creator, and Community & Growth each feature an introductory module and lesson.",
      "Builder Track is listed as 'coming soon' — an upcoming partnership, not yet enrollable.",
    ],
    content: {
      sections: [
        {
          heading: "Four Career Specializations",
          body: [
            "The global Web3 ecosystem hires diverse talent across creative, operational, and technical roles. Bridge3 Academy's Skill Set Track provides career specializations, each featuring an introductory module and lesson:",
          ],
          bullets: [
            "Designer Track: UI/UX design, visual identity, Web3 user experience, and interactive Figma prototyping.",
            "Creator Track: Content creation, technical writing, growth storytelling, and documentation.",
            "Community & Growth Track: Community management, social media strategy, ambassador programs, and operational growth.",
            "Builder Track: Protocol engineering and developer tooling — listed as 'coming soon' (a planned partnership, not yet open for enrollment).",
          ],
          callout: {
            type: "note",
            text: "We list the Builder Track with transparent 'coming soon' status rather than obscuring it. It represents an active partnership initiative and will open once finalized.",
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
    summary: "How to submit assignments, unlimited resubmissions, mentor feedback states, and peer discussion threads.",
    readTime: "3 min read",
    updatedAt: "October 2026",
    tags: ["workshops", "submissions", "assignments", "peer-discussions"],
    keyTakeaways: [
      "Submit your work as text, a file, or both.",
      "Resubmit as many times as you need — your full attempt history is preserved.",
      "Submissions move from Submitted to either Approved or Needs Revision with mentor feedback.",
      "Every assignment includes a peer discussion thread visible to all students.",
    ],
    content: {
      sections: [
        {
          heading: "Submitting Your Assignment",
          body: [
            "Practical workshops give you the chance to apply what you've learned. You can submit your work as text, a file, or both depending on the brief:",
          ],
          bullets: [
            "Text Submission: Written answers, GitHub repository URLs, Figma links, or deployment URLs.",
            "File Upload: Supported documents, images, or archives attached directly to your submission.",
            "Unlimited Resubmissions: You can resubmit as many times as you need — every attempt is kept in your history, nothing gets overwritten.",
          ],
        },
        {
          heading: "Submission Status & Mentor Feedback",
          body: [
            "Each submission's status moves from Submitted to either Approved or Needs Revision, set by a mentor along with written feedback you'll see directly on the assignment.",
            "If your submission is marked Needs Revision, read the mentor's notes, refine your work, and submit an updated version.",
          ],
        },
        {
          heading: "Peer Discussion Threads",
          body: [
            "Every assignment also has a peer discussion thread underneath it, visible to every student — a place to ask questions or compare notes.",
          ],
          callout: {
            type: "tip",
            text: "Use the discussion thread to ask cohort peers for help or share resources if you run into blockers on an assignment.",
          },
        },
      ],
    },
  },
  {
    slug: "mentor-review-process",
    title: "Project Evaluation & Review Process",
    category: "workshops",
    categoryLabel: "Workshops & Project Reviews",
    summary: "How mentor reviews work through direct qualitative judgment and feedback rather than arbitrary point rubrics.",
    readTime: "3 min read",
    updatedAt: "October 2026",
    tags: ["reviews", "mentors", "feedback", "evaluation"],
    keyTakeaways: [
      "Reviews are direct qualitative judgment calls by experienced mentors.",
      "There is no formal, published scoring rubric right now — reviews focus on written feedback.",
      "Outcomes are either Approved or Needs Revision.",
    ],
    content: {
      sections: [
        {
          heading: "Mentor Review Process",
          body: [
            "At Bridge3 Academy, project review is conducted by real practitioners who review your submissions individually.",
            "Clarification on evaluation criteria: There is no formal, published scoring rubric right now. Review is a direct judgment call by a mentor — they read your submission and mark it Approved or Needs Revision with written feedback.",
            "If a published rubric with specific criteria is introduced in the future, it will be published here. Right now, the process is built honestly on mentor judgment plus actionable feedback, not a points-based rubric.",
          ],
        },
        {
          heading: "The Revision Cycle",
          body: [
            "Receiving 'Needs Revision' is a natural part of the learning process. It gives you the chance to see where your work fell short and learn how to fix it before moving forward.",
            "Mentors provide clear written feedback explaining what needs adjustment so you can iterate with confidence.",
          ],
          callout: {
            type: "tip",
            text: "Take your mentor's feedback constructively. Making revisions mirrors the professional review process of pull requests and design feedback.",
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
    summary: "Capstone project guidelines, track requirements, submission fields, and mentor review process.",
    readTime: "3 min read",
    updatedAt: "October 2026",
    tags: ["capstone", "projects", "general-track", "graduation"],
    keyTakeaways: [
      "Capstones are required only for tracks that mandate them (currently the General Track).",
      "Submit a GitHub link, a portfolio description, and optionally an attached file.",
      "Capstones follow the same resubmission and mentor-review process as regular assignments.",
    ],
    content: {
      sections: [
        {
          heading: "When a Capstone is Required",
          body: [
            "Capstone projects are required only for tracks that need one (currently the General Track). Tracks that do not require a capstone can be completed by finishing all lessons, quizzes, and assignments.",
          ],
        },
        {
          heading: "Submitting Your Capstone",
          body: [
            "When submitting your capstone deliverable, provide:",
          ],
          bullets: [
            "GitHub Link: A public repository link containing your code, README documentation, or project assets.",
            "Portfolio Description: A comprehensive summary explaining the problem solved, architecture used, and key learnings.",
            "File Attachment (Optional): Any supporting diagrams, presentation slides, or files.",
          ],
        },
        {
          heading: "Review & Resubmissions",
          body: [
            "Capstones use the same resubmission and mentor-review process as regular assignments. Mentors inspect your submission and mark it Approved or Needs Revision with feedback, and you can resubmit whenever needed.",
          ],
        },
      ],
    },
  },

  // 4. Gamification & Community
  {
    slug: "xp-and-levels",
    title: "XP System",
    category: "gamification",
    categoryLabel: "Gamification & Community",
    summary: "How Experience Points (XP) are awarded across lessons, quizzes, assignments, and capstones, and how the leaderboard works.",
    readTime: "3 min read",
    updatedAt: "October 2026",
    tags: ["xp", "gamification", "leaderboard", "points"],
    keyTakeaways: [
      "There is no 'Levels' system — student progression is tracked purely through XP.",
      "10 XP per lesson, 25 XP per passed quiz (awarded once).",
      "15 XP per assignment submitted + 25 bonus on approval (40 XP total).",
      "20 XP per capstone submitted + 60 bonus on approval (80 XP total).",
      "The leaderboard shows the top 10 students platform-wide by total XP.",
    ],
    content: {
      sections: [
        {
          heading: "XP System Overview",
          body: [
            "Bridge3 Academy uses Experience Points (XP) to reward consistent learning and verified deliverables.",
            "Correction from earlier drafts: There is no 'Levels' system — just XP. Progression is measured directly by your accumulated XP points.",
          ],
        },
        {
          heading: "Current Point Values",
          body: [
            "XP is awarded deterministically based on your platform milestones:",
          ],
          table: {
            headers: ["Activity", "XP Awarded", "Rules"],
            rows: [
              ["Lesson Completed", "10 XP", "Awarded upon marking a lesson complete"],
              ["Quiz Passed", "25 XP", "Awarded once per quiz, not per retake"],
              ["Assignment Submitted", "15 XP", "Awarded upon submitting assignment"],
              ["Assignment Approved", "+25 XP Bonus", "Added on top once approved (40 XP total)"],
              ["Capstone Submitted", "20 XP", "Awarded upon submitting capstone"],
              ["Capstone Approved", "+60 XP Bonus", "Added on top once approved (80 XP total)"],
            ],
          },
        },
        {
          heading: "Platform Leaderboard",
          body: [
            "The platform leaderboard shows the top 10 students platform-wide ranked by total accumulated XP. Complete lessons, pass quizzes, and get your assignments approved to climb the rankings.",
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
    summary: "The eight automated milestone badges and how your unlisted public portfolio link showcases your proof of work.",
    readTime: "3 min read",
    updatedAt: "October 2026",
    tags: ["badges", "portfolio", "proof-of-work", "public-link"],
    keyTakeaways: [
      "Eight badges are earned automatically as you hit milestones and maintain streaks.",
      "Every student has a public portfolio page shareable by direct link.",
      "Portfolios are not searchable on Google — visible only to people with your exact link.",
    ],
    content: {
      sections: [
        {
          heading: "The Eight Automated Badges",
          body: [
            "Bridge3 Academy features eight skill badges, each earned automatically when you satisfy its condition:",
          ],
          table: {
            headers: ["Badge", "Requirement"],
            rows: [
              ["First Steps", "Completed your first lesson"],
              ["Building Momentum", "Completed 5 lessons"],
              ["Quiz Ace", "Passed your first quiz"],
              ["Contributor", "Submitted your first assignment"],
              ["Approved Work", "Had an assignment approved by a mentor"],
              ["Track Graduate", "Completed every requirement of a full track"],
              ["Streak Starter", "3-day activity streak"],
              ["Consistent Learner", "7-day activity streak"],
            ],
          },
        },
        {
          heading: "Your Public Portfolio Page",
          body: [
            "Every student has a public portfolio page — shareable by direct link, showing your name, track, XP, badges, and any proof-of-work links you choose to add.",
            "Privacy by design: It is intentionally not searchable on Google; only someone with your exact link can see it. This gives you complete control over who views your educational achievements.",
          ],
          callout: {
            type: "tip",
            text: "Add your public portfolio link to your CV, GitHub bio, or job applications to prove your completed coursework and mentor approvals.",
          },
        },
      ],
    },
  },
  {
    slug: "code-of-conduct",
    title: "Honor Code & Academic Integrity",
    category: "gamification",
    categoryLabel: "Gamification & Community",
    summary: "Expected standards of authentic effort, original deliverables, and upcoming formal academic integrity guidelines.",
    readTime: "3 min read",
    updatedAt: "October 2026",
    tags: ["honor-code", "integrity", "community", "conduct"],
    keyTakeaways: [
      "Expected standard: authentic independent effort, original submissions, and respectful peer collaboration.",
      "A formalized academic integrity policy will be published prior to our first cohort launch.",
      "Mentors review submissions for authenticity and originality.",
    ],
    content: {
      sections: [
        {
          heading: "Authentic Effort & Integrity",
          body: [
            "At Bridge3 Academy, true competence cannot be shortcutted. All coursework and deliverables are designed to prepare you for real-world opportunities where originality and understanding are vital.",
          ],
          bullets: [
            "Original Work: Quizzes and workshop deliverables must represent your own authentic knowledge and effort.",
            "Proper Attribution: When using external frameworks, documentation, or code snippets, acknowledge and cite your sources.",
            "Constructive Peer Community: Treat instructors, mentors, and cohort peers respectfully across all assignment discussion threads.",
          ],
        },
        {
          heading: "Formal Policy Notice",
          body: [
            "Please note: A comprehensive, formal academic integrity policy is currently being developed for our upcoming first cohort launch.",
            "Rather than presenting placeholder text dressed up as official policy, our team is formalizing clear rules regarding acceptable collaboration, plagiarism definitions, and review consequences in consultation with our mentor community. The finalized policy will be published here before cohort onboarding begins.",
          ],
          callout: {
            type: "note",
            text: "If you have questions about whether a particular collaboration or external resource is permitted on an assignment, ask in the assignment discussion thread.",
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
    summary: "The strict completion criteria required to unlock your certificate and how manual student claiming works.",
    readTime: "4 min read",
    updatedAt: "October 2026",
    tags: ["certificates", "standards", "completion", "claiming"],
    keyTakeaways: [
      "A track is complete only when every lesson is done, every quiz is passed, and every assignment is mentor-approved.",
      "If a track requires a capstone (such as the General Track), the capstone must also be mentor-approved.",
      "Certificates are claimed manually by the student, not issued automatically.",
      "Each certificate records your name, track title, completion score, issue date, and unique verification code.",
    ],
    content: {
      sections: [
        {
          heading: "Track Completion Criteria",
          body: [
            "A track is complete only when every one of the following is true:",
          ],
          bullets: [
            "Every lesson is marked done.",
            "Every quiz has a passing attempt.",
            "Every assignment has mentor-approved status (not just submitted).",
            "For tracks that require one (currently the General Track), the capstone is approved too.",
          ],
          callout: {
            type: "important",
            text: "All requirements must be fully satisfied. Partial completions do not qualify for certification.",
          },
        },
        {
          heading: "Claiming Your Certificate",
          body: [
            "Once complete, you'll see a 'Claim your certificate' button on the Certification page. Certificates aren't issued automatically — you choose when to claim.",
            "Each certificate shows your name and the track title as they were at the moment you claimed it, a completion score, the issue date, and a unique verification code.",
          ],
        },
      ],
    },
  },
  {
    slug: "cryptographic-verification",
    title: "How Certificate Verification Works",
    category: "certification",
    categoryLabel: "Certification & Standards",
    summary: "How unique verification codes allow employers, universities, and partners to verify certificate authenticity directly against our database.",
    readTime: "3 min read",
    updatedAt: "October 2026",
    tags: ["verification", "certificates", "validation", "public-link"],
    keyTakeaways: [
      "Certificates receive a random, unique verification code at the moment of issuance.",
      "Anyone with the code can view the public verification page at /certificates/[id] without logging in.",
      "Verification data is pulled directly from our database to confirm authenticity.",
      "Verification pages are intentionally excluded from search engines to safeguard student privacy.",
    ],
    content: {
      sections: [
        {
          heading: "Verification via Unique Code",
          body: [
            "Bridge3 Academy provides an instant, publicly accessible verification method for every issued certificate.",
            "Clarification on verification technology: The platform uses unique verification codes rather than cryptographic hashing (such as SHA-256). We state this accurately: each certificate gets a random, unique verification code at the moment it's issued.",
          ],
        },
        {
          heading: "The Public Verification Page",
          body: [
            "Anyone with that code or link can visit a public page (no login required) and see the real certificate details pulled directly from our database — confirming it's genuine.",
            "The verification page displays:",
          ],
          bullets: [
            "Recipient's full name as recorded at the time of claiming.",
            "Track title and official completion date.",
            "Verified competencies: lessons completed, quizzes passed, approved assignments, and capstone status.",
            "Unique verification code (e.g. B3A-2026-A8F29C).",
          ],
        },
        {
          heading: "Student Privacy",
          body: [
            "This verification page is intentionally not indexed by search engines, so it's shareable by link without a student's name becoming publicly searchable on Google.",
          ],
          callout: {
            type: "tip",
            text: "You can safely include your verification URL on your resume or LinkedIn profile knowing only those with your direct link can access the verification record.",
          },
        },
      ],
    },
  },
  {
    slug: "on-chain-future",
    title: "Future On-Chain Credentials & Multi-Chain Vision",
    category: "certification",
    categoryLabel: "Certification & Standards",
    summary: "Our architectural roadmap for swappable on-chain certificate minting across Bitcoin and Ethereum Layer 2s.",
    readTime: "4 min read",
    updatedAt: "October 2026",
    tags: ["roadmap", "on-chain", "credentials", "architecture"],
    keyTakeaways: [
      "Framed clearly as a future roadmap, not an active feature.",
      "The certificate system was deliberately built with a swappable adapter design.",
      "Underlying architecture allows issuing certificates on-chain for sponsor tracks without altering existing links.",
    ],
    content: {
      sections: [
        {
          heading: "Our Future On-Chain Vision",
          body: [
            "Important note: On-chain credential issuance is part of our future roadmap, not a currently active feature. Today's certificates use the database verification-code method described on the verification page.",
            "As Bridge3 Academy expands with partner protocols, graduates will have the option to anchor their verified credentials directly on-chain across Bitcoin Layer 2s (such as Stacks) or Ethereum Layer 2 networks.",
          ],
        },
        {
          heading: "Swappable Architectural Design",
          body: [
            "What's actually true about the implementation: the certificate system was deliberately built with a swappable design (using the CertificateAdapter interface).",
            "Today's certificates use the verification-code method, but the underlying code is structured so a future version could issue certificates on-chain for specific ecosystem/sponsor tracks, without needing to rebuild anything else in the platform.",
            "This is real, intentional architecture — just not yet turned on for anything.",
          ],
          callout: {
            type: "note",
            text: "Because issuance logic is decoupled from data presentation, adding on-chain minting will never break existing verification URLs or database records.",
          },
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
