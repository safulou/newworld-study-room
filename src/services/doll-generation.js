import { prepareCompanionPhoto } from "./image-pipeline.js";

const POLL_INTERVAL_MS = 2_000;
const MAX_POLLS = 60;

function safeAssetUrl(value) {
  if (typeof value !== "string") return "";
  try {
    const url = new URL(value, location.href);
    return url.origin === location.origin ? url.toString() : "";
  } catch {
    return "";
  }
}

async function waitForJob(statusUrl, onProgress) {
  for (let attempt = 0; attempt < MAX_POLLS; attempt += 1) {
    await new Promise((resolve) => window.setTimeout(resolve, POLL_INTERVAL_MS));
    const response = await fetch(statusUrl, { credentials: "same-origin" });
    if (!response.ok) throw new Error("3D 生成服務暫時無法回應。 ");
    const job = await response.json();
    onProgress(Math.max(76, Math.min(96, Number(job.progress) || 76)), "正在產生 3D 模型");
    if (job.status === "failed") throw new Error(job.message || "3D 模型生成失敗。 ");
    const modelUrl = safeAssetUrl(job.modelUrl);
    if (job.status === "completed" && modelUrl) return modelUrl;
  }
  throw new Error("3D 模型生成逾時，請稍後再試。 ");
}

export async function createCompanionAsset(file, onProgress = () => {}, { companionMode = "doll" } = {}) {
  const { photo, standeePhoto } = await prepareCompanionPhoto(
    file,
    (progress, label) => onProgress(Math.min(progress * 0.72, 72), label),
    { companionMode },
  );
  if (companionMode === "standee") return { photo, standeePhoto, modelUrl: "", mode: "standee" };
  const endpoint = import.meta.env.VITE_DOLL_GENERATION_URL;
  if (!endpoint) return { photo, standeePhoto, modelUrl: "", mode: "texture" };

  try {
    onProgress(74, "上傳至 3D 生成服務");
    const form = new FormData();
    form.append("photo", file);
    const response = await fetch(endpoint, { method: "POST", body: form, credentials: "same-origin" });
    if (!response.ok) throw new Error("3D 生成工作建立失敗。 ");
    const job = await response.json();
    const immediateModel = safeAssetUrl(job.modelUrl);
    const statusUrl = safeAssetUrl(job.statusUrl);
    const modelUrl = immediateModel || (statusUrl ? await waitForJob(statusUrl, onProgress) : "");
    if (!modelUrl) throw new Error("3D 生成服務沒有回傳可用模型。 ");
    onProgress(100, "3D 模型已完成");
    return { photo, standeePhoto, modelUrl, mode: "generated" };
  } catch (error) {
    return {
      photo,
      standeePhoto,
      modelUrl: "",
      mode: "texture",
      warning: error.message || "3D 生成服務暫時無法使用。 ",
    };
  }
}

export const generationInternals = { safeAssetUrl };
