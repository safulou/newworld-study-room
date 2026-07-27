const CLOUDFLARE_REALTIME_URL = "https://rtc.live.cloudflare.com/v1/turn/keys";

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

export async function onRequestGet({ env }) {
  if (!env.TURN_KEY_ID || !env.TURN_KEY_API_TOKEN) {
    return json({ error: "TURN is not configured" }, 503);
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
