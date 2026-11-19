import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RATE_LIMIT, onRequestGet, resetRateLimitForTests } from "../functions/api/turn-credentials.js";

const SITE = "https://study.example.com";
function req(headers = { Origin: SITE }, url = `${SITE}/api/turn-credentials`) {
  return new Request(url, { headers });
}

describe("TURN credentials function", () => {
  it("does not run without server-side secrets", async () => {
    const response = await onRequestGet({ request: req(), env: {} });
    expect(response.status).toBe(503);
  });

  it("returns short-lived ICE servers without browser-blocked port 53", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          iceServers: [
            { urls: ["stun:stun.cloudflare.com:3478", "stun:stun.cloudflare.com:53"] },
            {
              urls: [
                "turn:turn.cloudflare.com:3478?transport=udp",
                "turn:turn.cloudflare.com:53?transport=udp",
                "turns:turn.cloudflare.com:5349?transport=tcp",
              ],
              username: "short-lived-user",
              credential: "short-lived-secret",
            },
          ],
        }),
        { status: 201 },
      ),
    );

    resetRateLimitForTests();
    const response = await onRequestGet({
      request: req(),
      env: { TURN_KEY_ID: "key-id", TURN_KEY_API_TOKEN: "api-token" },
    });
    const payload = await response.json();
    const urls = payload.iceServers.flatMap((server) => server.urls);
    expect(response.status).toBe(200);
    expect(urls).not.toContain("stun:stun.cloudflare.com:53");
    expect(urls).not.toContain("turn:turn.cloudflare.com:53?transport=udp");
    expect(urls).toContain("turns:turn.cloudflare.com:5349?transport=tcp");
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("key-id"),
      expect.objectContaining({ method: "POST" }),
    );
    fetchMock.mockRestore();
  });

  describe("R7：只給自己的網頁、限速", () => {
    const env = { TURN_KEY_ID: "key-id", TURN_KEY_API_TOKEN: "api-token" };
    let fetchMock;
    beforeEach(() => {
      resetRateLimitForTests();
      fetchMock = vi
        .spyOn(globalThis, "fetch")
        .mockImplementation(async () => new Response(JSON.stringify({ iceServers: [] }), { status: 201 }));
    });
    afterEach(() => fetchMock.mockRestore());

    it.each([
      ["別的網站的 Origin", { Origin: "https://evil.example" }],
      ["沒有 Origin 也沒有 Referer（直接用 curl 打）", {}],
      ["Referer 是別的網站", { Referer: "https://evil.example/page" }],
      ["長得像但不是同一個網域", { Origin: "https://study.example.com.evil.example" }],
    ])("%s → 403，不去要憑證", async (_name, headers) => {
      const response = await onRequestGet({ request: req(headers), env });
      expect(response.status).toBe(403);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it.each([
      ["同一個網域", { Origin: SITE }],
      ["同源只帶 Referer", { Referer: `${SITE}/room/abc` }],
      ["本機開發 localhost", { Origin: "http://localhost:5178" }],
      ["本機開發 127.0.0.1", { Origin: "http://127.0.0.1:4173" }],
    ])("%s → 200", async (_name, headers) => {
      expect((await onRequestGet({ request: req(headers), env })).status).toBe(200);
    });

    it("ALLOWED_ORIGINS 列出的網域（例如 GitHub Pages 前端呼叫 Cloudflare 的函式）→ 200", async () => {
      const response = await onRequestGet({
        request: req({ Origin: "https://user.github.io" }),
        env: { ...env, ALLOWED_ORIGINS: "https://user.github.io, https://other.example" },
      });
      expect(response.status).toBe(200);
    });

    it(`同一個 IP 一分鐘超過 ${RATE_LIMIT} 次 → 429，不去要憑證`, async () => {
      const headers = { Origin: SITE, "CF-Connecting-IP": "203.0.113.9" };
      for (let i = 0; i < RATE_LIMIT; i++) {
        expect((await onRequestGet({ request: req(headers), env })).status).toBe(200);
      }
      const calls = fetchMock.mock.calls.length;
      expect((await onRequestGet({ request: req(headers), env })).status).toBe(429);
      expect(fetchMock.mock.calls.length).toBe(calls);
      const other = { Origin: SITE, "CF-Connecting-IP": "203.0.113.10" };
      expect((await onRequestGet({ request: req(other), env })).status).toBe(200);
    });

    it("有綁 KV 就用 KV 計數（跨機器）", async () => {
      const store = new Map();
      const kv = { get: vi.fn(async (k) => store.get(k) ?? null), put: vi.fn(async (k, v) => store.set(k, v)) };
      const headers = { Origin: SITE, "CF-Connecting-IP": "198.51.100.1" };
      for (let i = 0; i < RATE_LIMIT; i++)
        await onRequestGet({ request: req(headers), env: { ...env, TURN_RATE_KV: kv } });
      const response = await onRequestGet({ request: req(headers), env: { ...env, TURN_RATE_KV: kv } });
      expect(response.status).toBe(429);
      expect(kv.put).toHaveBeenCalledWith(expect.stringContaining("198.51.100.1"), expect.any(String), {
        expirationTtl: 120,
      });
    });
  });
});
