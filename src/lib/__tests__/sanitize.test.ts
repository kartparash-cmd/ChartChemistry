import { describe, it, expect } from "vitest";
import { sanitizeInput, sanitizeEmail, sanitizeName } from "@/lib/sanitize";

describe("sanitizeInput", () => {
  it("strips HTML tags from input", () => {
    expect(sanitizeInput("<script>alert('xss')</script>")).toBe("alert(&#x27;xss&#x27;)");
  });

  it("strips nested HTML tags", () => {
    expect(sanitizeInput("<div><b>bold</b></div>")).toBe("bold");
  });

  it("preserves normal text without HTML", () => {
    expect(sanitizeInput("Hello, world!")).toBe("Hello, world!");
  });

  it("handles empty string", () => {
    expect(sanitizeInput("")).toBe("");
  });

  it("handles special characters (ampersand)", () => {
    expect(sanitizeInput("Tom & Jerry")).toBe("Tom &amp; Jerry");
  });

  it("strips angle-bracket tags but preserves other special chars", () => {
    expect(sanitizeInput('He said "hello" & <b>goodbye</b>')).toBe(
      'He said &quot;hello&quot; &amp; goodbye'
    );
  });

  it("handles strings with only HTML tags", () => {
    expect(sanitizeInput("<br/><hr/>")).toBe("");
  });

  it("trims leading and trailing whitespace", () => {
    expect(sanitizeInput("  hello  ")).toBe("hello");
  });

  it("handles self-closing tags", () => {
    expect(sanitizeInput("line1<br/>line2")).toBe("line1line2");
  });
});

describe("sanitizeEmail", () => {
  it("lowercases and trims an email", () => {
    expect(sanitizeEmail("  USER@Example.COM  ")).toBe("user@example.com");
  });

  it("handles already-lowercase email", () => {
    expect(sanitizeEmail("user@example.com")).toBe("user@example.com");
  });

  it("handles email with mixed casing", () => {
    expect(sanitizeEmail("John.Doe@Gmail.Com")).toBe("john.doe@gmail.com");
  });

  it("trims whitespace only", () => {
    expect(sanitizeEmail("  test@test.com  ")).toBe("test@test.com");
  });
});

describe("sanitizeName", () => {
  it("enforces default max length of 100", () => {
    const longName = "A".repeat(150);
    const result = sanitizeName(longName);
    expect(result.length).toBe(100);
  });

  it("enforces custom max length", () => {
    const result = sanitizeName("Kartikeya Parashar", 10);
    expect(result).toBe("Kartikeya ");
  });

  it("trims whitespace", () => {
    expect(sanitizeName("  Alice  ")).toBe("Alice");
  });

  it("handles empty input", () => {
    expect(sanitizeName("")).toBe("");
  });

  it("strips HTML tags from name", () => {
    expect(sanitizeName("<b>Alice</b>")).toBe("Alice");
  });

  it("returns short names unchanged", () => {
    expect(sanitizeName("Bob")).toBe("Bob");
  });

  it("strips HTML then enforces length", () => {
    const html = "<script>" + "A".repeat(200) + "</script>";
    const result = sanitizeName(html, 50);
    expect(result.length).toBe(50);
    expect(result).not.toContain("<");
  });
});
