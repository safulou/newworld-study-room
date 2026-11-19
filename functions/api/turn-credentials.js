const CLOUDFLARE_REALTIME_URL = "https://rtc.live.cloudflare.com/v1/turn/keys";

// R7：只給自己的網頁用。允許的來源：這個請求自己的網域、ALLOWED_ORIGINS（逗號分隔）、本機開發（localhost／127.0.0.1 任何埠）
const LOCAL_ORIGIN = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/;
// 限速：同一個 IP 每分鐘最多 RATE_LIMIT 次。有綁 KV（TURN_RATE_KV）就用 KV（跨機器）；沒綁就用這個 isolate 的記憶體
// （盡力而為：Cloudflare 會把請求分到不同機器，只能擋住同一台上的連續請求）
export const RATE_LIMIT = 10;
const WINDOW_SECONDS = 60;
const memoryHits = new Map();

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store, private",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function originOf(value) {
  try {
    return new URL(value).origin;
  } catch {
    return "";
  }
}

export function isAllowedOrigin(request, env = {}) {
  const own = originOf(request.url);
  const extra = String(env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  // 瀏覽器的 fetch 會帶 Origin（同源 GET 不一定帶）；沒有 Origin 時看 Referer；兩個都沒有就拒絕（不是從網頁來的）
  const origin = request.headers.get("Origin") || originOf(request.headers.get("Referer") || "");
  if (!origin) return false;
  return origin === own || extra.includes(origin) || LOCAL_ORIGIN.test(origin);
}

export async function isRateLimited(request, env = {}, now = Date.now()) {
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const bucket = Math.floor(now / 1000 / WINDOW_SECONDS);
  const key = `turn:${ip}:${bucket}`;
  if (env.TURN_RATE_KV && typeof env.TURN_RATE_KV.get === "function") {
    const count = Number((await env.TURN_RATE_KV.get(key)) || 0) + 1;
    await env.TURN_RATE_KV.put(key, String(count), { expirationTtl: WINDOW_SECONDS * 2 });
    return count > RATE_LIMIT;
  }
  for (const k of memoryHits.keys()) {
    if (!k.endsWith(`:${bucket}`)) memoryHits.delete(k);
  }
  const count = (memoryHits.get(key) || 0) + 1;
  memoryHits.set(key, count);
  return count > RATE_LIMIT;
}

export function resetRateLimitForTests() {
  memoryHits.clear();
}

export async function onRequestGet({ request, env }) {
  if (!env.TURN_KEY_ID || !env.TURN_KEY_API_TOKEN) {
    return json({ error: "TURN is not configured" }, 503);
  }
  if (!request || !isAllowedOrigin(request, env)) {
    return json({ error: "Forbidden" }, 403);
  }
  if (await isRateLimited(request, env)) {
    return json({ error: "Too many requests" }, 429);
  }

  const response = await fetch(`${CLOUDFLARE_REALTIME_URL}/${env.TURN_KEY_ID}/credentials/generate-ice-servers`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.TURN_KEY_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ttl: 86_400 }),
  });

  if (!response.ok) {
    return json({ error: "TURN credentials are temporarily unavailable" }, 502);
  }

  const payload = await response.json();
  const iceServers = Array.isArray(payload.iceServers)
    ? payload.iceServers.map((server) => ({
        ...server,
        urls: (Array.isArray(server.urls) ? server.urls : [server.urls]).filter(
          (url) => !/:53(?:[/?]|$)/.test(String(url)),
        ),
      }))
    : [];
  return json({ iceServers });
}
