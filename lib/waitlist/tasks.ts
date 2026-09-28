export interface PublicWaitlistTask {
  id: string;
  title: string;
  description: string;
  actionUrl: string | null;
  actionLabel: string | null;
  inputType: "username" | "url" | "screenshot" | "none";
  inputPlaceholder: string | null;
  weight: number;
  isSystem: boolean;
  displayOrder: number;
}

export const DEFAULT_TASKS: PublicWaitlistTask[] = [
  {
    id: "confirm_email",
    title: "Confirm email",
    description: "Check your inbox for the confirmation link — automatic verification.",
    actionUrl: null,
    actionLabel: null,
    inputType: "none",
    inputPlaceholder: null,
    weight: 25,
    isSystem: true,
    displayOrder: 1,
  },
  {
    id: "telegram",
    title: "Join Telegram community",
    description: "Connect with fellow scholars, mentors, and receive official announcements.",
    actionUrl: "https://t.me/Bridge3Academy",
    actionLabel: "Open Telegram Channel",
    inputType: "username",
    inputPlaceholder: "@your_telegram_username",
    weight: 25,
    isSystem: false,
    displayOrder: 2,
  },
  {
    id: "x_twitter",
    title: "Follow X (Twitter)",
    description: "Follow @Bridge3Academy on X for announcements and ecosystem updates.",
    actionUrl: "https://x.com/Bridge3Academy",
    actionLabel: "Follow on X",
    inputType: "username",
    inputPlaceholder: "@your_x_handle",
    weight: 25,
    isSystem: false,
    displayOrder: 3,
  },
  {
    id: "referral",
    title: "Invite friends — earn XP for every verified invite",
    description: "Invite fellow learners. Earn 20 XP on Bridge3 for each friend who verifies their email (up to 500 XP).",
    actionUrl: null,
    actionLabel: null,
    inputType: "none",
    inputPlaceholder: null,
    weight: 25,
    isSystem: true,
    displayOrder: 4,
  },
];
