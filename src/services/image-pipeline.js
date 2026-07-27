const MAX_FILE_BYTES = 10 * 1024 * 1024;
const OUTPUT_SIZE = 768;
const STANDEE_HEIGHT = 1024;
const MAX_SOURCE_PIXELS = 48_000_000;
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

function canvasToDataUrl(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("照片壓縮失敗，請改用另一張圖片。"));
          return;
        }
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("照片無法轉換，請再試一次。"));
        reader.readAsDataURL(blob);
      },
      "image/jpeg",
      0.86,
    );
  });
}

export function validateImage(file) {
  if (!file) throw new Error("請先選擇照片。 ");
  if (!ACCEPTED_TYPES.has(file.type)) throw new Error("只支援 JPG、PNG 與 WebP 圖片。 ");
  if (file.size > MAX_FILE_BYTES) throw new Error("照片超過 10 MB，請先縮小檔案。 ");
}

export async function prepareCompanionPhoto(file, onProgress = () => {}, { companionMode = "doll" } = {}) {
  validateImage(file);
  onProgress(12, "讀取照片");
  const image = await loadImage(file);
  if (image.naturalWidth * image.naturalHeight > MAX_SOURCE_PIXELS) {
    throw new Error("照片解析度過高，請使用 4800 萬像素以下的圖片。 ");
  }
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

  onProgress(64, companionMode === "standee" ? "建立立牌印刷面" : "建立 3D 材質");
  const photo = await canvasToDataUrl(canvas);
  const standeeCanvas = document.createElement("canvas");
  standeeCanvas.width = OUTPUT_SIZE;
  standeeCanvas.height = STANDEE_HEIGHT;
  const standeeContext = standeeCanvas.getContext("2d", { alpha: false });
  const targetRatio = OUTPUT_SIZE / STANDEE_HEIGHT;
  const sourceRatio = image.naturalWidth / image.naturalHeight;
  const standeeWidth = sourceRatio > targetRatio ? image.naturalHeight * targetRatio : image.naturalWidth;
  const standeeHeight = sourceRatio > targetRatio ? image.naturalHeight : image.naturalWidth / targetRatio;
  const standeeX = (image.naturalWidth - standeeWidth) / 2;
  const standeeY = (image.naturalHeight - standeeHeight) / 2;
  standeeContext.fillStyle = "#f2d7b6";
  standeeContext.fillRect(0, 0, OUTPUT_SIZE, STANDEE_HEIGHT);
  standeeContext.drawImage(image, standeeX, standeeY, standeeWidth, standeeHeight, 0, 0, OUTPUT_SIZE, STANDEE_HEIGHT);
  const standeePhoto = await canvasToDataUrl(standeeCanvas);
  await nextFrame();
  onProgress(100, companionMode === "standee" ? "照片立牌已完成" : "3D 娃娃已完成");
  return { photo, standeePhoto };
}
