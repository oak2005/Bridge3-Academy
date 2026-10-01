import { randomUUID } from "crypto";
import { DEFAULT_TASKS, PublicWaitlistTask } from "@/lib/waitlist/tasks";

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
  // eslint-disable-next-line no-var
  var __mockWaitlistTasks: (PublicWaitlistTask & { isActive?: boolean })[] | undefined;
}

if (!global.__mockWaitlistSignups) {
  global.__mockWaitlistSignups = new Map<string, MockSignup>();
}

if (!global.__mockWaitlistSubmissions) {
  global.__mockWaitlistSubmissions = [];
}

if (!global.__mockWaitlistTasks) {
  global.__mockWaitlistTasks = DEFAULT_TASKS.map((t) => ({ ...t, isActive: true }));
}

export const mockSignups = global.__mockWaitlistSignups;
export const mockSubmissions = global.__mockWaitlistSubmissions;
export const mockTasks = global.__mockWaitlistTasks;

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

export function getMockTasks(): (PublicWaitlistTask & { isActive?: boolean })[] {
  return [...mockTasks].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
}

export function reorderMockTasks(orderedIds: string[]): (PublicWaitlistTask & { isActive?: boolean })[] {
  const map = new Map(mockTasks.map((t) => [t.id, t]));
  const reordered: (PublicWaitlistTask & { isActive?: boolean })[] = [];
  orderedIds.forEach((id, index) => {
    const item = map.get(id);
    if (item) {
      item.displayOrder = index + 1;
      reordered.push(item);
    }
  });
  mockTasks.forEach((t) => {
    if (!orderedIds.includes(t.id)) {
      t.displayOrder = reordered.length + 1;
      reordered.push(t);
    }
  });
  // Replace array contents
  mockTasks.length = 0;
  mockTasks.push(...reordered);
  return getMockTasks();
}

export function createMockTask(task: PublicWaitlistTask & { isActive?: boolean }): void {
  const existingIndex = mockTasks.findIndex((t) => t.id === task.id);
  if (existingIndex >= 0) {
    mockTasks[existingIndex] = { ...mockTasks[existingIndex], ...task };
  } else {
    mockTasks.push(task);
  }
}

export function updateMockTask(task: Partial<PublicWaitlistTask> & { id: string; isActive?: boolean }): void {
  const index = mockTasks.findIndex((t) => t.id === task.id);
  if (index >= 0) {
    mockTasks[index] = { ...mockTasks[index], ...task };
  } else {
    mockTasks.push({
      id: task.id,
      title: task.title || task.id,
      description: task.description || "",
      actionUrl: task.actionUrl || null,
      actionLabel: task.actionLabel || null,
      inputType: task.inputType || "username",
      inputPlaceholder: task.inputPlaceholder || null,
      weight: task.weight || 25,
      isSystem: false,
      displayOrder: task.displayOrder || mockTasks.length + 1,
      isActive: task.isActive !== false,
    });
  }
}

export function deleteMockTask(taskId: string): void {
  const index = mockTasks.findIndex((t) => t.id === taskId);
  if (index >= 0) {
    mockTasks.splice(index, 1);
  }
}

