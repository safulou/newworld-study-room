import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { generateQRMatrix, renderQrToCanvas } from "../src/services/qr-generator.js";

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
});
