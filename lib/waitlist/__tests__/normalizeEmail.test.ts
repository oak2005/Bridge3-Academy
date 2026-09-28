import { describe, it, expect } from "vitest";
import { normalizeEmail, isDisposableEmail } from "../normalizeEmail";

describe("normalizeEmail", () => {
  it("lowercases email address", () => {
    expect(normalizeEmail("USER@EXAMPLE.COM")).toBe("user@example.com");
  });

  it("removes dots from Gmail local part", () => {
    expect(normalizeEmail("john.doe.crypto@gmail.com")).toBe("johndoecrypto@gmail.com");
  });

  it("strips plus-addressing from Gmail", () => {
    expect(normalizeEmail("johndoe+web3@gmail.com")).toBe("johndoe@gmail.com");
    expect(normalizeEmail("john.doe+crypto123@gmail.com")).toBe("johndoe@gmail.com");
  });

  it("normalizes googlemail.com to gmail.com and strips dots/tags", () => {
    expect(normalizeEmail("john.doe+test@googlemail.com")).toBe("johndoe@gmail.com");
  });

  it("preserves dots for non-Gmail domains", () => {
    expect(normalizeEmail("john.doe@yahoo.com")).toBe("john.doe@yahoo.com");
    expect(normalizeEmail("jane.doe@outlook.com")).toBe("jane.doe@outlook.com");
  });

  it("handles empty or invalid strings gracefully", () => {
    expect(normalizeEmail("")).toBe("");
    expect(normalizeEmail("notanemail")).toBe("notanemail");
  });
});

describe("isDisposableEmail", () => {
  it("flags known disposable domains", () => {
    expect(isDisposableEmail("test@mailinator.com")).toBe(true);
    expect(isDisposableEmail("user@tempmail.com")).toBe(true);
    expect(isDisposableEmail("fake@10minutemail.com")).toBe(true);
    expect(isDisposableEmail("test@guerrillamail.com")).toBe(true);
  });

  it("allows standard domains", () => {
    expect(isDisposableEmail("test@gmail.com")).toBe(false);
    expect(isDisposableEmail("test@yahoo.com")).toBe(false);
    expect(isDisposableEmail("test@university.edu.ng")).toBe(false);
  });
});
