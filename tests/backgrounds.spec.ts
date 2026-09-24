import { expect, test } from "playwright/test";

test.use({ channel: "chrome", locale: "fr-FR", viewport: { width: 375, height: 812 } });
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

  const destinations = page.locator("[data-lens-stage] button");
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
  await expect(space.locator('a[href="https://bluevidia.com"]')).toHaveCount(1);
  await expect(
    page.locator('a[href*="EclatShop"], a[href*="Viewerbot"], a[href*="TimeManager"]'),
  ).toHaveCount(0);
});

test("project angles update the editorial narrative", async ({ page }) => {
  await openPortfolio(page, "#bluevidia");
  const space = page.locator('[data-space="bluevidia"]');
  await space.waitFor();

  await space.getByRole("button", { name: /02 · Réponse/i }).click();
  await expect(space.getByRole("heading", { level: 2 })).toHaveText("L'image devient l'interface.");
  await expect(space.getByText(/matière visuelle en temps réel/)).toBeVisible();
  const pointOfView = space.getByRole("slider", { name: "Faire varier le point de vue" });
  await expect(pointOfView).toBeVisible();
  await pointOfView.press("End");
  await expect(pointOfView).toHaveValue("100");
});

test("the film chapter can enter and leave its full-frame treatment", async ({ page }) => {
  await openPortfolio(page, "#bluevidia");
  const space = page.locator('[data-space="bluevidia"]');
  await space.getByRole("button", { name: "Plein cadre ↗" }).click();
  await expect(space).toHaveClass(/is-projecting/);
  await space.getByRole("button", { name: "Refermer ↙" }).click();
  await expect(space).not.toHaveClass(/is-projecting/);
});

test("changing language updates both the interface and document language", async ({ page }) => {
  await openPortfolio(page, "#contact");
  await page.getByRole("button", { name: "FR" }).click();
  await page.getByRole("button", { name: "English" }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("heading", { name: /deserves more than a template/ })).toBeVisible();
});

test("the profile keeps its six selected capabilities visible", async ({ page }) => {
  await openPortfolio(page, "#profile");
  const profile = page.locator('[data-space="profile"]');
  await profile.waitFor();

  const capabilities = profile.locator("[data-capability-list] button");
  await expect(capabilities).toHaveCount(6);
  await capabilities.filter({ hasText: "Cloud & DevOps" }).click();
  await expect(capabilities.filter({ hasText: "Cloud & DevOps" })).toHaveAttribute("aria-pressed", "true");
  await expect(profile.locator(".capability-note")).toContainText("infrastructure");
  await expect(profile.locator(".capability-note h2")).toHaveText("Cloud & DevOps");
});

test("the persistent optical rail connects every space", async ({ page }) => {
  await openPortfolio(page, "#contact");
  const rail = page.getByRole("navigation", { name: "Choisissez un signal" });
  await rail.getByRole("button", { name: "Profil" }).click();
  await expect(page).toHaveURL(/#profile$/);
  await expect(page.locator('[data-space="profile"]')).toBeVisible();
});

test("the contact address exposes a useful copied state", async ({ page }) => {
  await openPortfolio(page, "#contact");
  await page.getByRole("button", { name: /etienne\.mentrel/i }).click();
  await expect(page.getByText("Adresse copiée — à vous d'écrire.")).toBeVisible();
});

for (const width of [320, 768, 1024, 1440]) {
  test(`spaces fit the ${width}px viewport and keep usable targets`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 320 ? 568 : 900 });
    for (const section of ["profile", "bluevidia", "contact"]) {
      await openPortfolio(page, `#${section}`);
      const space = page.locator(`[data-space="${section}"]`);
      await space.waitFor();
      const geometry = await space.evaluate((element) => ({
        overflow: element.scrollWidth > element.clientWidth,
        smallTargets: Array.from(element.querySelectorAll("button, a")).filter((target) => {
          const rect = target.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0 && rect.height < 43;
        }).length,
      }));
      expect(geometry).toEqual({ overflow: false, smallTargets: 0 });
    }
  });
}

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
