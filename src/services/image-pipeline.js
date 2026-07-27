const MAX_FILE_BYTES = 10 * 1024 * 1024;
const OUTPUT_SIZE = 768;
const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function nextFrame() {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("照片無法讀取，請改用另一張圖片。"));
    };
    image.src = url;
  });
}

export function validateImage(file) {
  if (!file) throw new Error("請先選擇照片。 ");
  if (!ACCEPTED_TYPES.has(file.type)) throw new Error("只支援 JPG、PNG 與 WebP 圖片。 ");
  if (file.size > MAX_FILE_BYTES) throw new Error("照片超過 10 MB，請先縮小檔案。 ");
}

export async function prepareCompanionPhoto(file, onProgress = () => {}) {
  validateImage(file);
  onProgress(12, "讀取照片");
  const image = await loadImage(file);
  await nextFrame();

  onProgress(38, "裁切角色主體");
  const canvas = document.createElement("canvas");
  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;
  const context = canvas.getContext("2d", { alpha: false });
  const sourceSize = Math.min(image.naturalWidth, image.naturalHeight);
  const sx = (image.naturalWidth - sourceSize) / 2;
  const sy = (image.naturalHeight - sourceSize) / 2;
  context.fillStyle = "#f2d7b6";
  context.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
  context.drawImage(image, sx, sy, sourceSize, sourceSize, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
  await nextFrame();

  onProgress(72, "建立 3D 材質");
  const dataUrl = canvas.toDataURL("image/jpeg", .86);
  await nextFrame();
  onProgress(100, "3D 娃娃已完成");
  return dataUrl;
}
