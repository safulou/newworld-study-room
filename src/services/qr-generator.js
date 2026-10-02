/**
 * Pure Client-Side Zero-Dependency QR Code Generator
 * Implements ISO/IEC 18004 QR Code Model 2 (Byte mode, Error Correction Level M).
 * Generates crisp 2x Retina HTML5 Canvas rendering without external dependencies.
 */

// Galois Field GF(256) log and antilog tables (primitive polynomial x^8 + x^4 + x^3 + x^2 + 1 = 0x11d)
const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);

let gfVal = 1;
for (let i = 0; i < 255; i++) {
  GF_EXP[i] = gfVal;
  GF_EXP[i + 255] = gfVal;
  GF_LOG[gfVal] = i;
  gfVal = (gfVal << 1) ^ (gfVal >= 128 ? 0x11d : 0);
}

function gfMultiply(a, b) {
  if (a === 0 || b === 0) return 0;
  return GF_EXP[GF_LOG[a] + GF_LOG[b]];
}

function getRsGeneratorPoly(ecCount) {
  let poly = [1];
  for (let i = 0; i < ecCount; i++) {
    const nextRoot = [1, GF_EXP[i]];
    const res = new Uint8Array(poly.length + 1);
    for (let j = 0; j < poly.length; j++) {
      res[j] ^= poly[j];
      res[j + 1] ^= gfMultiply(poly[j], nextRoot[1]);
    }
    poly = res;
  }
  return poly;
}

function rsComputeRemainder(data, ecCount) {
  const poly = getRsGeneratorPoly(ecCount);
  const rem = new Uint8Array(ecCount);
  for (let i = 0; i < data.length; i++) {
    const factor = data[i] ^ rem[0];
    rem.copyWithin(0, 1);
    rem[ecCount - 1] = 0;
    for (let j = 0; j < ecCount; j++) {
      rem[j] ^= gfMultiply(poly[j + 1], factor);
    }
  }
  return rem;
}

// QR Code Model 2 Specification Table for Error Correction Level M (Versions 1-10)
const QR_VERSIONS = [
  null,
  { v: 1, total: 26, ec: 10, g1b: 1, g1d: 16, g2b: 0, g2d: 0, align: [], rem: 0 },
  { v: 2, total: 44, ec: 16, g1b: 1, g1d: 28, g2b: 0, g2d: 0, align: [6, 18], rem: 7 },
  { v: 3, total: 70, ec: 26, g1b: 1, g1d: 44, g2b: 0, g2d: 0, align: [6, 22], rem: 7 },
  { v: 4, total: 100, ec: 18, g1b: 2, g1d: 32, g2b: 0, g2d: 0, align: [6, 26], rem: 7 },
  { v: 5, total: 134, ec: 24, g1b: 2, g1d: 43, g2b: 0, g2d: 0, align: [6, 30], rem: 7 },
  { v: 6, total: 172, ec: 16, g1b: 4, g1d: 27, g2b: 0, g2d: 0, align: [6, 34], rem: 7 },
  { v: 7, total: 196, ec: 18, g1b: 4, g1d: 31, g2b: 0, g2d: 0, align: [6, 22, 38], rem: 0 },
  { v: 8, total: 242, ec: 22, g1b: 2, g1d: 38, g2b: 2, g2d: 39, align: [6, 24, 42], rem: 0 },
  { v: 9, total: 292, ec: 22, g1b: 3, g1d: 36, g2b: 2, g2d: 37, align: [6, 26, 46], rem: 0 },
  { v: 10, total: 346, ec: 26, g1b: 4, g1d: 43, g2b: 1, g2d: 44, align: [6, 28, 50], rem: 0 },
];

function getFormatBits(ecLevel, mask) {
  const data = (ecLevel << 3) | mask;
  let rem = data << 10;
  for (let i = 4; i >= 0; i--) {
    if ((rem >> (i + 10)) & 1) rem ^= 0x537 << i;
  }
  return ((data << 10) | rem) ^ 0x5412;
}

function getVersionInfoBits(v) {
  let d = v << 12;
  for (let i = 5; i >= 0; i--) {
    if ((d >> (i + 12)) & 1) d ^= 0x1f25 << i;
  }
  return (v << 12) | d;
}

const MASK_PATTERNS = [
  (r, c) => (r + c) % 2 === 0,
  (r) => r % 2 === 0,
  (_r, c) => c % 3 === 0,
  (r, c) => (r + c) % 3 === 0,
  (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0,
  (r, c) => ((r * c) % 2) + ((r * c) % 3) === 0,
  (r, c) => (((r * c) % 2) + ((r * c) % 3)) % 2 === 0,
  (r, c) => (((r + c) % 2) + ((r * c) % 3)) % 2 === 0,
];

function calculatePenalty(matrix, size) {
  let penalty = 0;

  // Rule 1: Rows
  for (let r = 0; r < size; r++) {
    let runLen = 1;
    for (let c = 1; c < size; c++) {
      if (matrix[r][c] === matrix[r][c - 1]) {
        runLen++;
      } else {
        if (runLen >= 5) penalty += 3 + (runLen - 5);
        runLen = 1;
      }
    }
    if (runLen >= 5) penalty += 3 + (runLen - 5);
  }

  // Rule 1: Columns
  for (let c = 0; c < size; c++) {
    let runLen = 1;
    for (let r = 1; r < size; r++) {
      if (matrix[r][c] === matrix[r - 1][c]) {
        runLen++;
      } else {
        if (runLen >= 5) penalty += 3 + (runLen - 5);
        runLen = 1;
      }
    }
    if (runLen >= 5) penalty += 3 + (runLen - 5);
  }

  // Rule 2: 2x2 blocks
  for (let r = 0; r < size - 1; r++) {
    for (let c = 0; c < size - 1; c++) {
      const v = matrix[r][c];
      if (v === matrix[r + 1][c] && v === matrix[r][c + 1] && v === matrix[r + 1][c + 1]) {
        penalty += 3;
      }
    }
  }

  // Rule 3: 1:1:3:1:1 patterns
  const p1 = [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0];
  const p2 = [0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c <= size - 11; c++) {
      let m1 = true;
      let m2 = true;
      for (let k = 0; k < 11; k++) {
        if (matrix[r][c + k] !== p1[k]) m1 = false;
        if (matrix[r][c + k] !== p2[k]) m2 = false;
      }
      if (m1) penalty += 40;
      if (m2) penalty += 40;
    }
  }
  for (let c = 0; c < size; c++) {
    for (let r = 0; r <= size - 11; r++) {
      let m1 = true;
      let m2 = true;
      for (let k = 0; k < 11; k++) {
        if (matrix[r + k][c] !== p1[k]) m1 = false;
        if (matrix[r + k][c] !== p2[k]) m2 = false;
      }
      if (m1) penalty += 40;
      if (m2) penalty += 40;
    }
  }

  // Rule 4: Dark proportion
  let dark = 0;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (matrix[r][c]) dark++;
    }
  }
  const ratio = (dark * 100) / (size * size);
  penalty += Math.floor(Math.abs(ratio - 50) / 5) * 10;

  return penalty;
}

/**
 * Generate 2D QR matrix for text using EC Level M.
 * @param {string} text - Content to encode
 * @returns {{ matrix: Uint8Array[], size: number, version: number, mask: number, penalty: number }}
 */
export function generateQRMatrix(text) {
  const bytes = new TextEncoder().encode(text || "");

  // Find minimum version that fits data
  let verInfo = null;
  for (let v = 1; v <= 10; v++) {
    const info = QR_VERSIONS[v];
    const totalData = info.g1b * info.g1d + info.g2b * info.g2d;
    const headerBits = 4 + (v <= 9 ? 8 : 16);
    if (bytes.length * 8 + headerBits <= totalData * 8) {
      verInfo = info;
      break;
    }
  }

  if (!verInfo) {
    throw new Error(`Data too large for QR Code Level M (max 213 bytes, received ${bytes.length} bytes)`);
  }

  const v = verInfo.v;
  const size = v * 4 + 17;
  const totalDataBytes = verInfo.g1b * verInfo.g1d + verInfo.g2b * verInfo.g2d;

  // Build bitstream
  const bits = [];
  function pushBits(val, len) {
    for (let i = len - 1; i >= 0; i--) bits.push((val >> i) & 1);
  }

  // Mode 4 = Byte mode (0100)
  pushBits(4, 4);
  pushBits(bytes.length, v <= 9 ? 8 : 16);
  for (const b of bytes) pushBits(b, 8);

  // Terminator (up to 4 zeroes)
  const maxBits = totalDataBytes * 8;
  const termLen = Math.min(4, maxBits - bits.length);
  for (let i = 0; i < termLen; i++) bits.push(0);

  // Pad to byte boundary
  while (bits.length % 8 !== 0) bits.push(0);

  // Alternate padding bytes 0xEC (236) and 0x11 (17)
  const padBytes = [0xec, 0x11];
  let padIdx = 0;
  while (bits.length < maxBits) {
    pushBits(padBytes[padIdx % 2], 8);
    padIdx++;
  }

  // Convert bits to data codewords
  const dataWords = new Uint8Array(totalDataBytes);
  for (let i = 0; i < totalDataBytes; i++) {
    let byteVal = 0;
    for (let b = 0; b < 8; b++) byteVal = (byteVal << 1) | bits[i * 8 + b];
    dataWords[i] = byteVal;
  }

  // Split into blocks and compute Reed-Solomon EC
  const blocks = [];
  let offset = 0;
  for (let b = 0; b < verInfo.g1b; b++) {
    const slice = dataWords.slice(offset, offset + verInfo.g1d);
    blocks.push({ data: slice, ec: rsComputeRemainder(slice, verInfo.ec) });
    offset += verInfo.g1d;
  }
  for (let b = 0; b < verInfo.g2b; b++) {
    const slice = dataWords.slice(offset, offset + verInfo.g2d);
    blocks.push({ data: slice, ec: rsComputeRemainder(slice, verInfo.ec) });
    offset += verInfo.g2d;
  }

  // Interleave data codewords
  const finalCodewords = [];
  const maxDataLen = Math.max(verInfo.g1d, verInfo.g2d);
  for (let i = 0; i < maxDataLen; i++) {
    for (let b = 0; b < blocks.length; b++) {
      if (i < blocks[b].data.length) finalCodewords.push(blocks[b].data[i]);
    }
  }

  // Interleave EC codewords
  for (let i = 0; i < verInfo.ec; i++) {
    for (let b = 0; b < blocks.length; b++) {
      finalCodewords.push(blocks[b].ec[i]);
    }
  }

  // Convert to bit sequence + remainder bits
  const finalBits = [];
  for (const cw of finalCodewords) {
    for (let i = 7; i >= 0; i--) finalBits.push((cw >> i) & 1);
  }
  for (let i = 0; i < verInfo.rem; i++) finalBits.push(0);

  // Setup Matrix
  const rawMatrix = Array.from({ length: size }, () => new Uint8Array(size));
  const isFunction = Array.from({ length: size }, () => new Uint8Array(size));

  function setModule(r, c, val, func = true) {
    rawMatrix[r][c] = val ? 1 : 0;
    if (func) isFunction[r][c] = 1;
  }

  // Draw 7x7 Finder patterns with 1-module separators
  function drawFinder(r0, c0) {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const nr = r0 + r;
        const nc = c0 + c;
        if (nr < 0 || nr >= size || nc < 0 || nc >= size) continue;
        const inFinder = r >= 0 && r <= 6 && c >= 0 && c <= 6;
        if (inFinder) {
          const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
          const isCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
          setModule(nr, nc, isBorder || isCenter);
        } else {
          setModule(nr, nc, 0); // white separator
        }
      }
    }
  }

  drawFinder(0, 0);
  drawFinder(0, size - 7);
  drawFinder(size - 7, 0);

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    const val = i % 2 === 0 ? 1 : 0;
    setModule(6, i, val);
    setModule(i, 6, val);
  }

  // Alignment patterns
  for (const r of verInfo.align) {
    for (const c of verInfo.align) {
      if (isFunction[r][c]) continue;
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          const isBorder = Math.abs(dr) === 2 || Math.abs(dc) === 2;
          const isCenter = dr === 0 && dc === 0;
          setModule(r + dr, c + dc, isBorder || isCenter);
        }
      }
    }
  }

  // Dark module
  setModule(size - 8, 8, 1);

  // Reserve format bits area
  for (let i = 0; i <= 8; i++) {
    isFunction[8][i] = 1;
    isFunction[i][8] = 1;
  }
  for (let i = size - 8; i < size; i++) {
    isFunction[8][i] = 1;
    isFunction[i][8] = 1;
  }

  // Reserve version info area (v >= 7)
  if (v >= 7) {
    for (let r = 0; r < 6; r++) {
      for (let c = size - 11; c < size - 8; c++) isFunction[r][c] = 1;
    }
    for (let r = size - 11; r < size - 8; r++) {
      for (let c = 0; c < 6; c++) isFunction[r][c] = 1;
    }
  }

  // Place data bits in 2-column zig-zag right-to-left
  let bitIdx = 0;
  let upwards = true;
  for (let right = size - 1; right > 0; right -= 2) {
    if (right === 6) right--; // skip timing column
    const rows = upwards
      ? Array.from({ length: size }, (_, i) => size - 1 - i)
      : Array.from({ length: size }, (_, i) => i);
    for (const r of rows) {
      for (let c = right; c > right - 2; c--) {
        if (!isFunction[r][c]) {
          rawMatrix[r][c] = bitIdx < finalBits.length ? finalBits[bitIdx++] : 0;
        }
      }
    }
    upwards = !upwards;
  }

  // Evaluate 8 masks and pick the lowest penalty score
  let bestMask = 0;
  let bestPenalty = Infinity;
  let bestMatrix = null;

  for (let mask = 0; mask < 8; mask++) {
    const candidate = Array.from({ length: size }, () => new Uint8Array(size));
    const maskFn = MASK_PATTERNS[mask];
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (isFunction[r][c]) {
          candidate[r][c] = rawMatrix[r][c];
        } else {
          candidate[r][c] = rawMatrix[r][c] ^ (maskFn(r, c) ? 1 : 0);
        }
      }
    }

    // Apply format bits (EC Level M = 0)
    const fmt = getFormatBits(0, mask);
    // Top-left
    for (let i = 0; i <= 5; i++) candidate[8][i] = (fmt >> (14 - i)) & 1;
    candidate[8][7] = (fmt >> 8) & 1;
    candidate[8][8] = (fmt >> 7) & 1;
    candidate[7][8] = (fmt >> 6) & 1;
    for (let i = 9; i <= 14; i++) candidate[14 - i][8] = (fmt >> (14 - i)) & 1;
    // Split: BL & TR
    for (let i = 0; i <= 6; i++) candidate[size - 1 - i][8] = (fmt >> i) & 1;
    for (let i = 7; i <= 14; i++) candidate[8][size - 15 + i] = (fmt >> i) & 1;

    // Apply version info if v >= 7
    if (v >= 7) {
      const verBits = getVersionInfoBits(v);
      for (let i = 0; i < 18; i++) {
        const bit = (verBits >> i) & 1;
        candidate[i % 6][size - 11 + Math.floor(i / 6)] = bit;
        candidate[size - 11 + Math.floor(i / 6)][i % 6] = bit;
      }
    }

    const pen = calculatePenalty(candidate, size);
    if (pen < bestPenalty) {
      bestPenalty = pen;
      bestMask = mask;
      bestMatrix = candidate;
    }
  }

  return { matrix: bestMatrix, size, version: v, mask: bestMask, penalty: bestPenalty };
}

/**
 * Render QR Code directly to an HTML5 Canvas element with Retina sharpness.
 * @param {HTMLCanvasElement} canvas
 * @param {string} text
 * @param {Object} [options]
 * @param {number} [options.size=240] - Logical display size in px
 * @param {number} [options.scale=2] - Device pixel ratio scale
 * @param {number} [options.margin=3] - Quiet zone margin in modules
 * @param {string} [options.darkColor='#0f172a'] - Foreground module color
 * @param {string} [options.lightColor='#ffffff'] - Background color
 * @returns {{ success: boolean, version?: number, size?: number, matrix?: Uint8Array[], error?: string }}
 */
export function renderQrToCanvas(canvas, text, options = {}) {
  if (!canvas) {
    return { success: false, error: "Canvas element not provided" };
  }

  const {
    size = 240,
    scale = typeof window !== "undefined" && window.devicePixelRatio ? Math.max(2, window.devicePixelRatio) : 2,
    margin = 3,
    darkColor = "#0f172a",
    lightColor = "#ffffff",
  } = options;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return { success: false, error: "Canvas 2D context not available" };
  }

  try {
    const qr = generateQRMatrix(text);
    const totalModules = qr.size + margin * 2;
    const pixelTarget = size * scale;
    const moduleSize = Math.max(2, Math.floor(pixelTarget / totalModules));
    const actualCanvasSize = moduleSize * totalModules;

    canvas.width = actualCanvasSize;
    canvas.height = actualCanvasSize;
    canvas.style.width = `${actualCanvasSize / scale}px`;
    canvas.style.height = `${actualCanvasSize / scale}px`;

    // Fill quiet zone background
    ctx.fillStyle = lightColor;
    ctx.fillRect(0, 0, actualCanvasSize, actualCanvasSize);

    // Draw dark modules
    ctx.fillStyle = darkColor;
    for (let r = 0; r < qr.size; r++) {
      for (let c = 0; c < qr.size; c++) {
        if (qr.matrix[r][c]) {
          const x = (c + margin) * moduleSize;
          const y = (r + margin) * moduleSize;
          ctx.fillRect(x, y, moduleSize, moduleSize);
        }
      }
    }

    return { success: true, version: qr.version, size: qr.size, matrix: qr.matrix };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Export canvas to PNG Blob
 * @param {HTMLCanvasElement} canvas
 * @returns {Promise<Blob|null>}
 */
export function exportQrBlob(canvas) {
  return new Promise((resolve) => {
    if (!canvas || typeof canvas.toBlob !== "function") {
      resolve(null);
      return;
    }
    canvas.toBlob((blob) => resolve(blob), "image/png");
  });
}

/**
 * Copy QR Code canvas image directly to clipboard
 * @param {HTMLCanvasElement} canvas
 * @returns {Promise<boolean>}
 */
export async function copyQrCanvasToClipboard(canvas) {
  try {
    if (
      typeof navigator === "undefined" ||
      !navigator.clipboard ||
      typeof window === "undefined" ||
      !window.ClipboardItem
    ) {
      return false;
    }
    const blob = await exportQrBlob(canvas);
    if (!blob) return false;
    await navigator.clipboard.write([
      new ClipboardItem({
        "image/png": blob,
      }),
    ]);
    return true;
  } catch {
    return false;
  }
}

/**
 * Trigger download of QR Code canvas as a PNG file
 * @param {HTMLCanvasElement} canvas
 * @param {string} [filename]
 */
export function downloadQrCanvas(canvas, filename = `study-room-qr-${new Date().toISOString().split("T")[0]}.png`) {
  if (!canvas || typeof canvas.toDataURL !== "function") return;
  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/png");
  link.click();
}
