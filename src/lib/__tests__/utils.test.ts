import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn() utility", () => {
  it("merges class names correctly", () => {
    const result = cn("text-red-500", "bg-blue-500");
    expect(result).toBe("text-red-500 bg-blue-500");
  });

  it("resolves Tailwind conflicts (last class wins)", () => {
    const result = cn("text-red-500", "text-blue-500");
    expect(result).toBe("text-blue-500");
  });

  it("handles conditional classes via clsx syntax", () => {
    const isActive = true;
    const isDisabled = false;
    const result = cn("base", isActive && "active", isDisabled && "disabled");
    expect(result).toBe("base active");
  });

  it("handles undefined values", () => {
    const result = cn("base", undefined, "extra");
    expect(result).toBe("base extra");
  });

  it("handles null values", () => {
    const result = cn("base", null, "extra");
    expect(result).toBe("base extra");
  });

  it("handles false values", () => {
    const result = cn("base", false, "extra");
    expect(result).toBe("base extra");
  });

  it("handles empty string", () => {
    const result = cn("");
    expect(result).toBe("");
  });

  it("handles no arguments", () => {
    const result = cn();
    expect(result).toBe("");
  });

  it("handles object syntax for conditional classes", () => {
    const result = cn({ "text-red-500": true, "bg-blue-500": false });
    expect(result).toBe("text-red-500");
  });

  it("handles array syntax", () => {
    const result = cn(["text-red-500", "bg-blue-500"]);
    expect(result).toBe("text-red-500 bg-blue-500");
  });

  it("merges padding classes correctly (Tailwind merge)", () => {
    const result = cn("px-4 py-2", "px-6");
    expect(result).toBe("py-2 px-6");
  });

  it("merges multiple conflicting Tailwind classes", () => {
    const result = cn("mt-2 mb-4", "mt-8");
    expect(result).toBe("mb-4 mt-8");
  });
});
