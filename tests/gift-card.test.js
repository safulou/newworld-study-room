import { describe, expect, it } from "vitest";
import { buildGiftsGrid, cleanText, GIFT_LIMITS, sanitizeGift } from "../src/services/gift-card.js";

const XSS = '<img src=x onerror="window.__pwned=1">';

describe("R7：書伴贈禮不能注入 HTML", () => {
  it("暱稱、花語、題字裡的 <img onerror> 顯示成純文字，不會變成元素", () => {
    const grid = buildGiftsGrid(document, [
      {
        id: "g1",
        plantKey: "rose",
        senderNickname: XSS,
        quote: XSS,
        personalInscription: XSS,
        receivedAt: "2026-11-19",
      },
    ]);
    document.body.replaceChildren(grid);
    expect(grid.querySelector("img")).toBeNull();
    expect(window.__pwned).toBeUndefined();
    expect(grid.querySelector(".gift-sender-badge").textContent).toBe(`💌 來自「${XSS.slice(0, 24)}」`);
    expect(grid.querySelector(".gift-inscription").textContent).toBe(XSS);
    expect(grid.querySelector(".gift-quote").title).toBe(XSS);
  });

  it("data 屬性裡的引號不會跳出屬性（舊的 innerHTML 版本會）", () => {
    const grid = buildGiftsGrid(document, [
      { id: 'x" onclick="alert(1)', plantKey: "rose", senderNickname: '"><b>x</b>' },
    ]);
    const btn = grid.querySelector(".btn-gift-gratitude");
    expect(btn.getAttribute("onclick")).toBeNull();
    expect(btn.dataset.giftId).toBe('x" onclick="alert(1)');
    expect(grid.querySelector("b")).toBeNull();
  });

  it("localStorage 裡的舊資料（R7 之前存的、超長、含 HTML）照樣只顯示成文字並截斷", () => {
    const old = {
      id: "old",
      plantKey: "tulip",
      senderNickname: "長".repeat(500),
      personalInscription: `${XSS}`.repeat(50),
    };
    const grid = buildGiftsGrid(document, [old, null, "壞資料"]);
    expect(grid.querySelectorAll(".gift-card").length).toBe(1);
    expect(grid.querySelector(".gift-sender-badge").textContent).toBe(`💌 來自「${"長".repeat(24)}」`);
    expect(Array.from(grid.querySelector(".gift-inscription").textContent).length).toBe(
      GIFT_LIMITS.personalInscription,
    );
    expect(grid.querySelector("img")).toBeNull();
  });

  it("cleanText：去掉控制字元和方向控制字元、依字元截斷不切壞 emoji", () => {
    expect(cleanText("a\u0000b‮c\n", 10)).toBe("abc");
    expect(cleanText("🌿🌿🌿", 2)).toBe("🌿🌿");
    expect(cleanText(123, 5)).toBe("");
  });

  it("sanitizeGift：只留已知欄位、限長度、plantKey 只收英數", () => {
    const g = sanitizeGift({
      plantKey: "../../x",
      senderNickname: "n".repeat(100),
      quote: "q".repeat(500),
      personalInscription: "p".repeat(999),
      extra: "<script>",
      timestamp: 1,
    });
    expect(g).toEqual({
      plantKey: "",
      senderNickname: "n".repeat(GIFT_LIMITS.senderNickname),
      quote: "q".repeat(GIFT_LIMITS.quote),
      personalInscription: "p".repeat(GIFT_LIMITS.personalInscription),
      timestamp: 1,
    });
  });
});
