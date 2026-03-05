import { describe, it, expect, vi, beforeAll } from "vitest";
import { render } from "@testing-library/react";
import { StarField } from "@/components/star-field";

// Mock canvas APIs that jsdom doesn't support
beforeAll(() => {
  // Mock HTMLCanvasElement.getContext
  HTMLCanvasElement.prototype.getContext = vi.fn(
    () =>
      ({
        clearRect: vi.fn(),
        beginPath: vi.fn(),
        arc: vi.fn(),
        fill: vi.fn(),
        scale: vi.fn(),
        fillStyle: "",
      }) as unknown as CanvasRenderingContext2D
  );

  // Mock getBoundingClientRect
  HTMLCanvasElement.prototype.getBoundingClientRect = vi.fn(
    () =>
      ({
        width: 800,
        height: 600,
        top: 0,
        left: 0,
        bottom: 600,
        right: 800,
        x: 0,
        y: 0,
        toJSON: vi.fn(),
      }) as DOMRect
  );

  // Mock requestAnimationFrame
  vi.stubGlobal(
    "requestAnimationFrame",
    vi.fn((cb: FrameRequestCallback) => {
      // Don't actually call the callback to prevent infinite animation loop
      return 1;
    })
  );

  vi.stubGlobal("cancelAnimationFrame", vi.fn());

  // Mock IntersectionObserver as a proper class and track instances
  const mockObserve = vi.fn();
  const mockDisconnect = vi.fn();
  class MockIntersectionObserver {
    observe = mockObserve;
    disconnect = mockDisconnect;
    unobserve = vi.fn();
    root = null;
    rootMargin = "";
    thresholds: number[] = [];
    takeRecords = vi.fn(() => [] as IntersectionObserverEntry[]);
    constructor(_callback: IntersectionObserverCallback, _options?: IntersectionObserverInit) {}
  }
  vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
  vi.stubGlobal("__mockObserve", mockObserve);

  // Mock devicePixelRatio
  Object.defineProperty(window, "devicePixelRatio", {
    value: 1,
    writable: true,
  });
});

describe("StarField component", () => {
  it("renders without crashing", () => {
    const { container } = render(<StarField />);
    expect(container).toBeDefined();
  });

  it("renders a canvas element", () => {
    const { container } = render(<StarField />);
    const canvas = container.querySelector("canvas");
    expect(canvas).not.toBeNull();
  });

  it("canvas has aria-hidden attribute for accessibility", () => {
    const { container } = render(<StarField />);
    const canvas = container.querySelector("canvas");
    expect(canvas?.getAttribute("aria-hidden")).toBe("true");
  });

  it("applies the default CSS classes", () => {
    const { container } = render(<StarField />);
    const canvas = container.querySelector("canvas");
    expect(canvas?.className).toContain("pointer-events-none");
    expect(canvas?.className).toContain("absolute");
    expect(canvas?.className).toContain("inset-0");
  });

  it("applies custom className prop", () => {
    const { container } = render(<StarField className="custom-class" />);
    const canvas = container.querySelector("canvas");
    expect(canvas?.className).toContain("custom-class");
  });

  it("calls getContext on mount", () => {
    render(<StarField />);
    expect(HTMLCanvasElement.prototype.getContext).toHaveBeenCalledWith("2d");
  });

  it("sets up IntersectionObserver for visibility tracking", () => {
    render(<StarField />);
    // The component creates an IntersectionObserver and calls observe() on the canvas
    const mockObserve = (globalThis as unknown as Record<string, ReturnType<typeof vi.fn>>).__mockObserve;
    expect(mockObserve).toHaveBeenCalled();
  });

  it("requests animation frame on mount", () => {
    render(<StarField starCount={50} />);
    expect(requestAnimationFrame).toHaveBeenCalled();
  });
});
