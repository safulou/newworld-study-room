# CLAUDE.md — NewWorld Study Room

> Session start:
> 「讀 CLAUDE.md 和 logs/devlog-YYYY-MM-DD.md（最新日誌），告訴我專案現況與 P0 任務。」

## Project Overview

`newworld-study-room` 是一個無伺服器依賴、注重隱私與沉浸感的線上自習室 Web 應用。
核心功能包含：

- **3D 伴讀夥伴**：支援 3D 玩偶（暖心、偵探、星空魔法學者造型）與雙面照片立牌，具備點擊 Squash & Stretch 彈跳動態與番茄鐘姿態聯動。
- **純代碼 Web Audio 音頻**：即時合成背景音樂（《給愛麗絲》）與伴讀水晶音效（Bubble Chime），零外部音檔依賴。
- **專注計時與花園**：防時間飄移的番茄鐘，隨專注時數成長的生態花園（玫瑰、鬱金香、多肉、仙人掌、松樹）。
- **去中心化 P2P 便簽**：透過 WebRTC DataChannel（PeerJS）在自習夥伴間傳遞便簽（Tip），收到時夜空劃過流星。

## Development Rules

- **語言規範**：面相對話、開發日誌、文件與 Commit 訊息預設使用繁體中文（Traditional Chinese）。
- **純前端零版權依賴**：音效與背景音樂一律採用 Web Audio API 純代碼合成，不引入外部未授權 mp3/音效檔。
- **隱私第一**：照片貼圖裁切與壓縮必須在瀏覽器端本機完成，不得擅自外傳至非授權後端。
- **品質驗證標準**：修改代碼後必須通過完整 CI 檢查：
  ```bash
  npm run check
  ```
  （包含 Prettier 格式檢查、ESLint 靜態分析、全量 Vitest 單元測試與 Vite 生產打包）。

## Common Commands

```bash
# 本地開發啟動
npm run dev -- --host 0.0.0.0

# 執行全量測試
npm test

# 執行完整驗證
npm run check

# 代碼自動格式化
npx prettier --write .
```

## Session End Flow

收尾流程：

1. 執行 `git status` 與 `git diff --stat`。
2. 更新當日 `logs/devlog-YYYY-MM-DD.md`（採用標準七區塊格式）。
3. 貼出日誌區塊等待使用者確認。
4. 使用者確認後執行：程式碼 commit → devlog commit → `git push origin main`。
5. 產出 Google 工作日誌填寫摘要供使用者複製。
