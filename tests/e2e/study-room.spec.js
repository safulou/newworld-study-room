import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("renders the core room without overflow or serious accessibility violations", async ({ page }, testInfo) => {
  await page.goto("./");
  await expect(page.locator("#dollCanvas")).toBeVisible();
  await expect(page.locator("body")).toHaveCSS("overflow-x", "visible");

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(overflow).toBe(false);

  if (testInfo.project.name === "mobile") {
    await expect(page.locator(".mobile-nav")).toBeVisible();
    const targets = await page
      .locator(".mobile-nav button")
      .evaluateAll((buttons) => buttons.map((button) => button.getBoundingClientRect().height));
    expect(targets.every((height) => height >= 44)).toBe(true);
    const tipTop = await page.locator("#tipPanel").evaluate((element) => element.getBoundingClientRect().top);
    const uploadTop = await page.locator("#dollPanel").evaluate((element) => element.getBoundingClientRect().top);
    expect(tipTop).toBeLessThan(uploadTop);
  }

  if (testInfo.project.name === "desktop") {
    const noteColors = await page
      .locator(".note")
      .evaluateAll((notes) => notes.map((note) => note.style.getPropertyValue("--note-paper")));
    expect(new Set(noteColors).size).toBe(noteColors.length);

    const results = await new AxeBuilder({ page }).disableRules(["color-contrast"]).analyze();
    expect(results.violations.filter((violation) => ["critical", "serious"].includes(violation.impact))).toEqual([]);
  }
});

test("delivers a Tip between independent browser contexts", async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "The same protocol path is covered once on desktop.");
  test.setTimeout(70_000);
  const hostContext = await browser.newContext();
  const guestContext = await browser.newContext();
  const host = await hostContext.newPage();
  const guest = await guestContext.newPage();
  await host.goto("http://127.0.0.1:4173/newworld-study-room/", { waitUntil: "domcontentloaded" });
  await expect(host.locator("#inviteLink")).toHaveValue(/^https?:/, { timeout: 20_000 });
  const invite = await host.locator("#inviteLink").inputValue();
  expect(invite).toContain("#token=");

  await guest.goto(invite, { waitUntil: "domcontentloaded" });
  await expect(guest.locator("#connectionStatus")).toContainText("已加入", { timeout: 30_000 });
  await guest.locator("#nickname").fill("Alice");
  await guest.locator("#nickname").blur();
  await guest.locator("#noteInput").fill("今天也一起努力");
  await guest.locator("#noteForm").press("Enter");

  await expect(host.locator("#notes")).toContainText("今天也一起努力");
  await expect(guest.locator(".tip-delivery").first()).toHaveText("已送達");
  await hostContext.close();
  await guestContext.close();
});

test("grows the selected focus plant with the study timer", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "Timer behavior is covered once on desktop.");
  await page.goto("./");

  await page.locator("#plantType").selectOption("tulip");
  await expect(page.locator("#focusGarden")).toHaveAttribute("data-plant", "tulip");
  await expect(page.locator("#gardenStatus")).toContainText("鬱金香");

  await page.locator("#toggleTimer").click();
  await expect
    .poll(async () =>
      Number(await page.locator("#focusGarden").evaluate((element) => element.style.getPropertyValue("--growth"))),
    )
    .toBeGreaterThan(0);

  await page.locator("#resetTimer").click();
  await expect(page.locator("#focusGarden")).toHaveCSS("--growth", "0.0000");
  await expect(page.locator("#gardenStatus")).toContainText("種子");
});

test("switches between the 3D doll and photo standee", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "Companion mode behavior is covered once on desktop.");
  await page.goto("./");

  const standeeButton = page.locator('button[data-companion-mode="standee"]');
  await standeeButton.click();
  await expect(page.locator("#avatarZone")).toHaveAttribute("data-companion-mode", "standee");
  await expect(standeeButton).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#dollStyleSwitch")).toBeHidden();
  await expect(page.locator("#dollCanvas")).toHaveAttribute("aria-label", "可旋轉的照片伴讀立牌");

  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9ZlGQAAAAASUVORK5CYII=",
    "base64",
  );
  await page.locator("#photoInput").setInputFiles({ name: "character.png", mimeType: "image/png", buffer: png });
  await expect(page.locator("#generationPercent")).toHaveText("100%", { timeout: 15_000 });
  const savedProfile = await page.evaluate(() => JSON.parse(localStorage.getItem("newworld-study-room:profile:v3")));
  expect(savedProfile.photo).toMatch(/^data:image\/jpeg;base64,/);
  expect(savedProfile.standeePhoto).toMatch(/^data:image\/jpeg;base64,/);

  await page.reload();
  await expect(page.locator("#avatarZone")).toHaveAttribute("data-companion-mode", "standee");
});
