import { expect, test } from "playwright/test";

test.use({ channel: "chrome", viewport: { width: 375, height: 812 } });
const PORTFOLIO_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";

async function openPortfolio(page: import("playwright/test").Page, hash = "") {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => window.localStorage.clear());
  await page.goto(`${PORTFOLIO_URL}/${hash}`);
}

test("the fixed spatial hub has one WebGL canvas and no overflow", async ({ page }) => {
  await openPortfolio(page);
  await page.getByRole("button", { name: "Explorer" }).waitFor();

  await expect(page.locator("canvas")).toHaveCount(1);
  const dimensions = await page.evaluate(() => ({
    width: document.documentElement.scrollWidth,
    height: document.documentElement.scrollHeight,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
  }));
  expect(dimensions.width).toBe(dimensions.viewportWidth);
  expect(dimensions.height).toBe(dimensions.viewportHeight);
});

test("the hub exposes three non-linear destinations", async ({ page }) => {
  await openPortfolio(page);
  await page.getByRole("button", { name: "Explorer" }).waitFor();

  const destinations = page.locator("nav button");
  await expect(destinations).toHaveCount(3);
  await expect(destinations.nth(0)).toContainText("BlueVidia");
  await expect(destinations.nth(1)).toContainText("Profil");
  await expect(destinations.nth(2)).toContainText("Contact");
});

test("BlueVidia is the only showcased project", async ({ page }) => {
  await openPortfolio(page, "#bluevidia");
  const space = page.locator('[data-space="bluevidia"]');
  await space.waitFor();

  await expect(space.getByRole("heading", { name: "BlueVidia", exact: true }).first()).toBeVisible();
  await expect(space.locator('a[href="https://bluevidia.com"]')).toHaveCount(2);
  await expect(
    page.locator('a[href*="EclatShop"], a[href*="Viewerbot"], a[href*="TimeManager"]'),
  ).toHaveCount(0);
});

test("project angles update the editorial narrative", async ({ page }) => {
  await openPortfolio(page, "#bluevidia");
  const space = page.locator('[data-space="bluevidia"]');
  await space.waitFor();

  await space.getByRole("checkbox", { name: /02 · RÉPONSE/ }).click();
  await expect(space.getByRole("heading", { level: 2 })).toHaveText("BlueVidia");
  await expect(space.getByText(/matière visuelle en temps réel/)).toBeVisible();
});

test("the profile keeps its six selected capabilities visible", async ({ page }) => {
  await openPortfolio(page, "#profile");
  const profile = page.locator('[data-space="profile"]');
  await profile.waitFor();

  await expect(profile.locator("li")).toHaveText([
    "01Développement créatif",
    "02Next.js & React",
    "03Three.js & GLSL",
    "04Systèmes de mouvement",
    "05Cloud & DevOps",
    "06Mise en production",
  ]);
});

test("Escape returns from a space to the hub", async ({ page }) => {
  await openPortfolio(page, "#contact");
  await page.getByRole("heading", { name: /Un projet qui mérite/ }).waitFor();

  await page.keyboard.press("Escape");

  await expect(page).not.toHaveURL(/#contact$/);
  await expect(page.getByRole("button", { name: "Explorer" })).toBeVisible();
});

test("the shader reports no compilation errors", async ({ page }) => {
  const shaderErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error" && message.text().includes("Shader Error")) {
      shaderErrors.push(message.text());
    }
  });

  await openPortfolio(page);
  await page.getByRole("button", { name: "Explorer" }).waitFor();
  expect(shaderErrors).toEqual([]);
});
