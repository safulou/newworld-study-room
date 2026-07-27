import { describe, expect, it, vi } from "vitest";
import { onRequestGet } from "../functions/api/turn-credentials.js";

describe("TURN credentials function", () => {
  it("does not run without server-side secrets", async () => {
    const response = await onRequestGet({ env: {} });
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

    const response = await onRequestGet({ env: { TURN_KEY_ID: "key-id", TURN_KEY_API_TOKEN: "api-token" } });
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
});
