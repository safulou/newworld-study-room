import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  generateQRMatrix,
  renderQrToCanvas,
  exportQrBlob,
  copyQrCanvasToClipboard,
  downloadQrCanvas,
} from "../src/services/qr-generator.js";

describe("qr-generator", () => {
  let originalGetContext;

  beforeEach(() => {
    originalGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
      fillRect: vi.fn(),
      fillStyle: "",
    });
  });

  afterEach(() => {
    HTMLCanvasElement.prototype.getContext = originalGetContext;
  });

  describe("generateQRMatrix", () => {
    it("generates a valid Version 1 matrix for short text", () => {
      const qr = generateQRMatrix("HELLO");
      expect(qr.version).toBe(1);
      expect(qr.size).toBe(21);
      expect(qr.matrix.length).toBe(21);
      expect(qr.matrix[0].length).toBe(21);

      // Top-left finder pattern center should be dark
      expect(qr.matrix[3][3]).toBe(1);
      // Top-left finder outer ring should be dark
      expect(qr.matrix[0][0]).toBe(1);
      expect(qr.matrix[0][6]).toBe(1);
      expect(qr.matrix[6][0]).toBe(1);
      expect(qr.matrix[6][6]).toBe(1);

      // Top-right finder outer ring
      expect(qr.matrix[0][14]).toBe(1);
      expect(qr.matrix[0][20]).toBe(1);

      // Bottom-left finder outer ring
      expect(qr.matrix[14][0]).toBe(1);
      expect(qr.matrix[20][0]).toBe(1);

      // Dark module at (size - 8, 8)
      expect(qr.matrix[13][8]).toBe(1);
    });

    it("automatically scales up QR version for longer URLs", () => {
      const roomUrl = "https://newworld-study-room.pages.dev/?room=NW-STUDY-9988";
      const qr = generateQRMatrix(roomUrl);
      expect(qr.version).toBeGreaterThanOrEqual(3);
      expect(qr.size).toBe(qr.version * 4 + 17);
      expect(qr.mask).toBeGreaterThanOrEqual(0);
      expect(qr.mask).toBeLessThanOrEqual(7);
      expect(qr.matrix.length).toBe(qr.size);
    });

    it("handles Chinese characters and emojis encoded in UTF-8", () => {
      const qr = generateQRMatrix("新世界自習室 ✨ 旅人專注 ☕");
      expect(qr.version).toBeGreaterThan(0);
      expect(qr.matrix.length).toBe(qr.size);
    });

    it("throws when data exceeds maximum capacity", () => {
      const hugeString = "X".repeat(300);
      expect(() => generateQRMatrix(hugeString)).toThrow("Data too large");
    });
  });

  describe("renderQrToCanvas", () => {
    it("renders QR matrix into HTMLCanvasElement successfully", () => {
      const canvas = document.createElement("canvas");
      const res = renderQrToCanvas(canvas, "https://study.app/?room=NW-1234", {
        size: 200,
        scale: 2,
        margin: 3,
      });

      expect(res.success).toBe(true);
      expect(res.version).toBeDefined();
      expect(res.size).toBeDefined();
      expect(canvas.width).toBeGreaterThan(0);
      expect(canvas.height).toBeGreaterThan(0);
      expect(canvas.getContext).toHaveBeenCalledWith("2d");
    });

    it("returns error object when canvas is invalid or missing", () => {
      const res = renderQrToCanvas(null, "text");
      expect(res.success).toBe(false);
      expect(res.error).toContain("Canvas element not provided");
    });

    it("handles overflow gracefully without throwing unhandled exception", () => {
      const canvas = document.createElement("canvas");
      const res = renderQrToCanvas(canvas, "A".repeat(500));
      expect(res.success).toBe(false);
      expect(res.error).toBeDefined();
    });
  });

  describe("exportQrBlob, copyQrCanvasToClipboard, and downloadQrCanvas", () => {
    it("exportQrBlob resolves with blob when canvas.toBlob is available", async () => {
      const canvas = document.createElement("canvas");
      const mockBlob = new Blob(["dummy"], { type: "image/png" });
      canvas.toBlob = vi.fn((cb) => cb(mockBlob));

      const blob = await exportQrBlob(canvas);
      expect(blob).toBe(mockBlob);
      expect(canvas.toBlob).toHaveBeenCalled();
    });

    it("exportQrBlob resolves null if canvas is null or toBlob is missing", async () => {
      const res = await exportQrBlob(null);
      expect(res).toBeNull();
    });

    it("copyQrCanvasToClipboard copies image via ClipboardItem when supported", async () => {
      const canvas = document.createElement("canvas");
      const mockBlob = new Blob(["dummy"], { type: "image/png" });
      canvas.toBlob = vi.fn((cb) => cb(mockBlob));

      const mockWrite = vi.fn().mockResolvedValue(undefined);
      class MockClipboardItem {
        constructor(data) {
          this.data = data;
        }
      }
      global.ClipboardItem = MockClipboardItem;
      window.ClipboardItem = MockClipboardItem;
      Object.defineProperty(navigator, "clipboard", {
        value: { write: mockWrite },
        configurable: true,
      });

      const success = await copyQrCanvasToClipboard(canvas);
      expect(success).toBe(true);
      expect(mockWrite).toHaveBeenCalled();
    });

    it("copyQrCanvasToClipboard returns false when clipboard API is unavailable or fails", async () => {
      const canvas = document.createElement("canvas");
      const originalClipboard = navigator.clipboard;
      Object.defineProperty(navigator, "clipboard", {
        value: undefined,
        configurable: true,
      });

      const success = await copyQrCanvasToClipboard(canvas);
      expect(success).toBe(false);

      Object.defineProperty(navigator, "clipboard", {
        value: originalClipboard,
        configurable: true,
      });
    });

    it("downloadQrCanvas creates an anchor and triggers click", () => {
      const canvas = document.createElement("canvas");
      canvas.toDataURL = vi.fn().mockReturnValue("data:image/png;base64,mockdata");

      const clickSpy = vi.fn();
      const createElementSpy = vi.spyOn(document, "createElement").mockImplementation((tag) => {
        if (tag === "a") {
          return { click: clickSpy, set download(val) {}, set href(val) {} };
        }
        return document.createElement(tag);
      });

      downloadQrCanvas(canvas, "test-qr.png");
      expect(clickSpy).toHaveBeenCalled();
      createElementSpy.mockRestore();
    });
  });
});
