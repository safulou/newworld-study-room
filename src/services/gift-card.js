// 書伴贈禮卡片（R7）：贈禮的暱稱、題字、花語都來自同房的 P2P 對方，一律當純文字放進 DOM（textContent），
// 不拼 innerHTML；localStorage 裡的舊資料讀出時也走這裡，所以舊的惡意內容也只會顯示成文字。

// 控制字元、方向控制字元（可以把顯示順序反轉、偽裝內容）一律拿掉
// eslint-disable-next-line no-control-regex -- 就是要比對控制字元
const CONTROL_CHARS = /[\u0000-\u001f\u007f-\u009f‎‏‪-‮⁦-⁩]/g;

export const GIFT_LIMITS = Object.freeze({
  senderNickname: 24,
  quote: 120,
  personalInscription: 200,
  plantName: 40,
  plantIcon: 8,
  plantKey: 40,
});

/** 不是字串就當空字串；去掉控制字元、頭尾空白，再依「字元」（不切壞 emoji）截到 max */
export function cleanText(value, max) {
  if (typeof value !== "string") return "";
  const text = value.replace(CONTROL_CHARS, "").trim();
  const chars = Array.from(text);
  return chars.length > max ? chars.slice(0, max).join("") : text;
}

/** 收到的贈禮：只留已知欄位、限長度 */
export function sanitizeGift(raw) {
  const g = raw && typeof raw === "object" ? raw : {};
  return {
    plantKey: /^[a-zA-Z0-9_-]{1,40}$/.test(String(g.plantKey || "")) ? g.plantKey : "",
    senderNickname: cleanText(g.senderNickname, GIFT_LIMITS.senderNickname),
    quote: cleanText(g.quote, GIFT_LIMITS.quote),
    personalInscription: cleanText(g.personalInscription, GIFT_LIMITS.personalInscription),
    timestamp: Number.isFinite(g.timestamp) ? g.timestamp : undefined,
  };
}

function el(doc, tag, className, text) {
  const node = doc.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/** 一張贈禮卡片（DOM 節點）。g：store 裡的 receivedBookmarks 一筆；meta：植物圖鑑資料 */
export function buildGiftCard(doc, g, meta = {}) {
  const plantName = cleanText(g.plantName || meta.name || "草木標本", GIFT_LIMITS.plantName);
  const plantIcon = cleanText(g.plantIcon || meta.icon || "🌿", GIFT_LIMITS.plantIcon);
  const date = g.receivedAt ? new Date(g.receivedAt) : null;
  const dateStr = date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString() : "";
  const sender = cleanText(g.senderNickname, GIFT_LIMITS.senderNickname) || "書伴";
  const quote = cleanText(g.quote || meta.flowerLanguage || "", GIFT_LIMITS.quote);
  const note = cleanText(g.personalInscription || g.inscription || "", GIFT_LIMITS.personalInscription);
  const id = typeof g.id === "string" ? g.id : "";
  const plantKey = typeof g.plantKey === "string" ? g.plantKey : "";

  const card = el(doc, "div", "gift-card");
  const header = el(doc, "div", "gift-card-header");
  header.append(el(doc, "span", "gift-sender-badge", `💌 來自「${sender}」`), el(doc, "span", "gift-time", dateStr));
  const body = el(doc, "div", "gift-card-body");
  const info = el(doc, "div", "gift-plant-info");
  info.append(el(doc, "div", "gift-plant-name", plantName));
  if (quote) {
    const q = el(doc, "div", "gift-quote", quote);
    q.title = quote;
    info.append(q);
  }
  body.append(el(doc, "div", "gift-plant-icon", plantIcon), info);
  card.append(header, body);
  if (note) card.append(el(doc, "p", "gift-inscription", note));

  const actions = el(doc, "div", "gift-card-actions");
  const view = el(doc, "button", "btn-view-gift-bookmark", "🔖 展閱書籤");
  view.type = "button";
  view.title = "展開檢視草木書籤拍立得卡片";
  view.dataset.giftId = id;
  view.dataset.plantKey = plantKey;
  actions.append(view);
  if (g.gratitudeSent) {
    const sent = el(doc, "span", "gift-gratitude-sent-badge", "已回謝 🕊️");
    sent.title = "已於空中向書伴致謝";
    actions.append(sent);
  } else {
    const thank = el(doc, "button", "btn-gift-gratitude", "💌 空中回謝");
    thank.type = "button";
    thank.title = "向贈禮書伴傳送空中銘謝訊息";
    thank.dataset.giftId = id;
    thank.dataset.senderNickname = sender;
    thank.dataset.plantKey = plantKey;
    actions.append(thank);
  }
  card.append(actions);
  return card;
}

/** 整個贈禮清單 */
export function buildGiftsGrid(doc, gifts, speciesTable = {}) {
  const grid = el(doc, "div", "gifts-grid");
  for (const g of gifts) {
    if (!g || typeof g !== "object") continue;
    grid.append(buildGiftCard(doc, g, speciesTable[g.plantKey] || {}));
  }
  return grid;
}
