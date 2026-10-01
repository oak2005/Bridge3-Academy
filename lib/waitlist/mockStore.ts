import { randomUUID } from "crypto";

export interface MockSignup {
  id: string;
  email: string;
  email_confirmed: boolean;
  confirmation_token: string;
  referred_by: string | null;
  created_at: string;
}

export interface MockSubmission {
  id: string;
  waitlist_signup_id: string;
  task_type: string;
  submission_text: string | null;
  screenshot_path: string | null;
  status: "pending_review" | "verified" | "rejected";
  created_at: string;
}

// Global persistent store across hot reloads in Next.js dev server
declare global {
  // eslint-disable-next-line no-var
  var __mockWaitlistSignups: Map<string, MockSignup> | undefined;
  // eslint-disable-next-line no-var
  var __mockWaitlistSubmissions: MockSubmission[] | undefined;
}

if (!global.__mockWaitlistSignups) {
  global.__mockWaitlistSignups = new Map<string, MockSignup>();
}

if (!global.__mockWaitlistSubmissions) {
  global.__mockWaitlistSubmissions = [];
}

export const mockSignups = global.__mockWaitlistSignups;
export const mockSubmissions = global.__mockWaitlistSubmissions;

export function isPlaceholderSupabase(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return !url || url.includes("placeholder") || !key || key.includes("placeholder");
}

export function createMockSignup(email: string, referredBy?: string | null): MockSignup {
  // Check existing
  for (const item of mockSignups.values()) {
    if (item.email.toLowerCase() === email.toLowerCase()) {
      return item;
    }
  }

  const id = randomUUID();
  const confirmation_token = randomUUID();
  const newSignup: MockSignup = {
    id,
    email,
    email_confirmed: false,
    confirmation_token,
    referred_by: referredBy || null,
    created_at: new Date().toISOString(),
  };

  mockSignups.set(id, newSignup);
  return newSignup;
}

export function findMockSignupById(id: string): MockSignup | undefined {
  return mockSignups.get(id);
}

export function findMockSignupByEmail(email: string): MockSignup | undefined {
  const normalized = email.toLowerCase().trim();
  for (const item of mockSignups.values()) {
    if (item.email.toLowerCase().trim() === normalized) {
      return item;
    }
  }
  return undefined;
}

export function findMockSignupByToken(token: string): MockSignup | undefined {
  for (const item of mockSignups.values()) {
    if (item.confirmation_token === token) {
      return item;
    }
  }
  return undefined;
}

export function confirmMockSignupEmail(id: string): boolean {
  const signup = mockSignups.get(id);
  if (!signup) return false;
  signup.email_confirmed = true;
  return true;
}

export function addMockSubmission(
  waitlistSignupId: string,
  taskType: string,
  submissionText: string | null,
  screenshotPath: string | null = null,
  status: "pending_review" | "verified" | "rejected" = "pending_review"
): MockSubmission {
  const sub: MockSubmission = {
    id: randomUUID(),
    waitlist_signup_id: waitlistSignupId,
    task_type: taskType,
    submission_text: submissionText,
    screenshot_path: screenshotPath,
    status,
    created_at: new Date().toISOString(),
  };
  mockSubmissions.unshift(sub);
  return sub;
}

export function getMockSubmissionsForSignup(signupId: string): MockSubmission[] {
  return mockSubmissions.filter((s) => s.waitlist_signup_id === signupId);
}
