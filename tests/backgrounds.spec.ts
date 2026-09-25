import { expect, test, type Page } from "playwright/test";

test.use({ channel: "chrome", locale: "fr-FR", viewport: { width: 375, height: 812 } });
const PORTFOLIO_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3001";

async function openPortfolio(page: Page, hash = "", reducedMotion = true) {
  await page.emulateMedia({ reducedMotion: reducedMotion ? "reduce" : "no-preference" });
  await page.addInitScript(() => window.localStorage.clear());
  await page.goto(`${PORTFOLIO_URL}/${hash}`);
  await page.locator("[aria-busy='false']").waitFor();
}

test("the living index is immediately understandable and keeps one WebGL canvas", async ({ page }) => {
  await openPortfolio(page);
  await expect(page.getByRole("heading", { name: /Je construis des idées/ })).toBeVisible();
  await expect(page.getByRole("main")).toHaveCount(1);
  await expect(page.locator("canvas")).toHaveCount(1);

  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Aller au contenu principal" })).toBeFocused();

  const destinations = page.locator("[data-experience-index] nav button");
  await expect(destinations).toHaveCount(4);
  await expect(destinations).toContainText(["Travaux", "Laboratoire", "Profil", "Contact"]);

  await page.getByRole("button", { name: /Laboratoire/ }).hover();
  await expect(page.locator("[data-creative-matter]")).toHaveAttribute("data-destination", "lab");
  await page.locator("[data-experience-index] h1").hover();
  await expect(page.locator("[data-creative-matter]")).toHaveAttribute("data-destination", "index");

  const viewport = await page.evaluate(() => ({
    width: document.documentElement.scrollWidth,
    height: document.documentElement.scrollHeight,
    viewportWidth: innerWidth,
    viewportHeight: innerHeight,
  }));
  expect(viewport.width).toBe(viewport.viewportWidth);
  expect(viewport.height).toBe(viewport.viewportHeight);
});

test("visited status and destination number never overlap", async ({ page }) => {
  await openPortfolio(page);
  await page.locator("[data-experience-index] nav button").first().click();
  await page.getByRole("button", { name: /Retour à l.index/ }).click();

  const firstDestination = page.locator("[data-experience-index] nav button").first();
  await expect(firstDestination.getByText("Exploré", { exact: true })).toBeVisible();
  const separated = await firstDestination.evaluate((card) => {
    const index = card.querySelector<HTMLElement>("[class*='destinationIndex']")?.getBoundingClientRect();
    const visited = card.querySelector<HTMLElement>("[class*='visited']")?.getBoundingClientRect();
    if (!index || !visited) return false;
    return index.bottom <= visited.top || visited.bottom <= index.top || index.right <= visited.left || visited.right <= index.left;
  });
  expect(separated).toBe(true);
});

test("Work frames BlueVidia as a delivered client commission", async ({ page }) => {
  await openPortfolio(page, "#work");
  await expect(page).toHaveTitle("Travaux — Etienne Mentrel");
  const work = page.locator('[data-space="work"]');
  await expect(work).toBeVisible();
  await expect(work.getByRole("heading", { name: "BlueVidia", exact: true })).toBeVisible();
  await expect(work.getByText(/Commande client · Projet phare/)).toBeVisible();
  await expect(work.locator('a[href="https://bluevidia.com"]')).toHaveCount(1);
  await expect(page.locator('a[href*="EclatShop"], a[href*="Viewerbot"], a[href*="TimeManager"]')).toHaveCount(0);
});

test("the BlueVidia narrative remains interactive without owning the portfolio", async ({ page }) => {
  await openPortfolio(page, "#work");
  const work = page.locator('[data-space="work"]');
  const viewport = work.locator("[data-case-viewport]");
  const initialHeight = await viewport.evaluate((element) => element.getBoundingClientRect().height);
  await expect(work.locator("video")).toHaveCount(0);
  await expect(work.locator('img[src*="cloudfront"]')).toHaveCount(0);

  const chapters = work.getByLabel("Explorer les trois temps du projet");
  await chapters.getByRole("button", { name: /Réponse/ }).click();
  await expect(work.getByRole("heading", { level: 3 })).toHaveText("L'image devient l'interface.");
  const pointOfView = work.getByRole("slider", { name: "Faire varier le point de vue" });
  await expect(pointOfView).toBeVisible();
  await pointOfView.press("End");
  await expect(pointOfView).toHaveValue("100");
  expect(await viewport.evaluate((element) => element.getBoundingClientRect().height)).toBeCloseTo(initialHeight, 0);

  await chapters.getByRole("button", { name: /Résultat/ }).click();
  await expect(work.getByRole("heading", { level: 3 })).toHaveText("Une expérience réellement en ligne.");
  expect(await viewport.evaluate((element) => element.getBoundingClientRect().height)).toBeCloseTo(initialHeight, 0);
});

test("the Lab exposes three honest manipulable studies", async ({ page }) => {
  await openPortfolio(page, "#lab");
  const lab = page.locator('[data-space="lab"]');
  await expect(lab.getByRole("heading", { name: /créativité se prouve/ })).toBeVisible();
  await expect(lab.getByRole("heading", { level: 2 })).toContainText(["Matière", "Typographie", "Interaction / système"]);

  const density = lab.getByRole("slider", { name: "Comprimer la matière" });
  await density.press("End");
  await expect(density).toHaveValue("100");
  const type = lab.getByRole("slider", { name: "Mettre le mot sous tension" });
  await type.press("End");
  await expect(type).toHaveValue("100");

  const propagate = lab.getByRole("button", { name: "Propager" });
  const route = [
    { intensity: "0.2", state: "Forme" },
    { intensity: "0.4", state: "Mouvement" },
    { intensity: "0.6", state: "Règle" },
    { intensity: "0.8", state: "Retour" },
    { intensity: "1", state: "Boucle complète" },
  ];
  for (const step of route) {
    await expect(propagate).toHaveAttribute("data-sfx-intensity", step.intensity);
    await propagate.click();
    await expect(lab.getByRole("status").filter({ hasText: step.state })).toBeVisible();
  }
  await expect(propagate).toHaveAttribute("data-sfx-intensity", "0");
  await propagate.click();
  await expect(lab.getByRole("status").filter({ hasText: "Origine" })).toBeVisible();
  await expect(propagate).toHaveAttribute("data-sfx-intensity", "0.2");

  const alignment = await lab.locator("article").last().evaluate((article) => {
    const nodes = Array.from(article.querySelectorAll<HTMLElement>("[data-active] b"));
    const path = article.querySelector<HTMLElement>("[class*='systemPath']");
    if (nodes.length !== 6 || !path) return null;
    const first = nodes[0].getBoundingClientRect();
    const last = nodes[5].getBoundingClientRect();
    const line = path.getBoundingClientRect();
    return {
      firstDelta: Math.abs(first.left + first.width / 2 - line.left),
      lastDelta: Math.abs(last.left + last.width / 2 - line.right),
    };
  });
  expect(alignment).not.toBeNull();
  expect(alignment!.firstDelta).toBeLessThan(1);
  expect(alignment!.lastDelta).toBeLessThan(1);
});

test("sound effects are controllable and persist the visitor preference", async ({ page }) => {
  await openPortfolio(page, "#lab");
  const sound = page.getByRole("button", { name: "Désactiver les effets sonores" });
  await expect(sound).toHaveAttribute("aria-pressed", "true");
  await sound.click();
  await expect(page.getByRole("button", { name: "Activer les effets sonores" })).toHaveAttribute("aria-pressed", "false");
  await expect.poll(() => page.evaluate(() => window.localStorage.getItem("portfolio:sfx-enabled"))).toBe("false");
});

test("Profile demonstrates a five-step method with evidence", async ({ page }) => {
  await openPortfolio(page, "#profile");
  const profile = page.locator('[data-space="profile-v2"]');
  await expect(profile).toBeVisible();
  const process = profile.getByRole("navigation", { name: "Processus interactif" });
  await expect(process.getByRole("button")).toHaveCount(5);
  expect(await process.evaluate((element) => getComputedStyle(element).flexDirection)).toBe("row");
  for (const step of ["Cadrer", "Prototyper", "Donner forme", "Ingénier", "Livrer"]) {
    await process.getByRole("button", { name: new RegExp(step) }).click();
    await expect(profile.getByRole("heading", { level: 2, name: step })).toBeVisible();
  }
  await process.getByRole("button", { name: /Ingénier/ }).click();
  await expect(profile.getByText(/fallbacks/).first()).toBeVisible();
});

test("Contact recomposes the visit and keeps direct actions", async ({ page }) => {
  await openPortfolio(page, "#contact");
  await expect(page).toHaveTitle("Contact — Etienne Mentrel");
  const contact = page.locator('[data-space="contact-v2"]');
  await expect(contact.getByRole("link", { name: /Écrire un email/ })).toHaveAttribute("href", "mailto:etienne.mentrel@gmail.com");
  await contact.getByRole("button", { name: /Copier l’adresse email/ }).click();
  await expect(contact.getByText(/Adresse copiée|copie automatique est indisponible/).first()).toBeVisible();
  await expect(contact.getByText(/aucune donnée collectée/)).toBeVisible();
  await expect(contact.getByText(/La prochaine trace peut être la vôtre/).first()).toBeVisible();
});

test("mobile editorial details stay aligned and never collide", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });

  await openPortfolio(page);
  const indexAlignment = await page.evaluate(() => {
    const sound = document.querySelector<HTMLElement>("[data-sfx-control]")?.getBoundingClientRect();
    const eyebrow = document.querySelector<HTMLElement>("[data-experience-index] p")?.getBoundingClientRect();
    return sound && eyebrow ? sound.bottom <= eyebrow.top : false;
  });
  expect(indexAlignment).toBe(true);

  await openPortfolio(page, "#profile");
  const process = page.getByRole("navigation", { name: "Processus interactif" });
  const firstPairFits = await process.getByRole("button").evaluateAll((buttons) => {
    const rail = buttons[0]?.parentElement?.getBoundingClientRect();
    const second = buttons[1]?.getBoundingClientRect();
    return Boolean(rail && second && second.right <= rail.right + 1);
  });
  expect(firstPairFits).toBe(true);

  await openPortfolio(page, "#contact");
  const contactAlignment = await page.locator('[data-space="contact-v2"]').evaluate((contact) => {
    const copy = contact.querySelector<HTMLElement>("[class*='journeyStatement'] strong")?.getBoundingClientRect();
    const sculpture = contact.querySelector<HTMLElement>("[class*='signalSculpture']")?.getBoundingClientRect();
    return copy && sculpture ? copy.bottom <= sculpture.top : false;
  });
  expect(contactAlignment).toBe(true);
});

test("tablet chrome stays local instead of framing the whole viewport", async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 900 });
  await openPortfolio(page, "#lab");

  const chrome = await page.evaluate(() => {
    const header = document.querySelector<HTMLElement>("#main-experience > header");
    const back = header?.querySelector<HTMLElement>("button");
    const backIcon = back?.querySelector<HTMLElement>("span:first-child");
    const heading = document.querySelector<HTMLElement>('[data-space="lab"] h1');
    if (!header || !back || !backIcon || !heading) return null;
    return {
      headerBackground: getComputedStyle(header).backgroundColor,
      headerBorderWidth: getComputedStyle(header).borderTopWidth,
      backBackground: getComputedStyle(back).backgroundColor,
      backBorderWidth: getComputedStyle(back).borderTopWidth,
      backIconBackground: getComputedStyle(backIcon).backgroundColor,
      backIconBorderRadius: getComputedStyle(backIcon).borderRadius,
      headingOutline: getComputedStyle(heading).outlineStyle,
    };
  });

  expect(chrome).toEqual({
    headerBackground: "rgba(0, 0, 0, 0)",
    headerBorderWidth: "0px",
    backBackground: "rgba(0, 0, 0, 0)",
    backBorderWidth: "0px",
    backIconBackground: "rgba(7, 8, 11, 0.95)",
    backIconBorderRadius: "50%",
    headingOutline: "none",
  });
});

test("mobile index remains vertically scrollable", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await openPortfolio(page, "");

  const index = page.locator("[data-experience-index]");
  await expect(index).toBeVisible();
  const before = await index.evaluate((element) => ({
    clientHeight: element.clientHeight,
    scrollHeight: element.scrollHeight,
    scrollTop: element.scrollTop,
    touchAction: getComputedStyle(element).touchAction,
  }));

  expect(before.scrollHeight).toBeGreaterThan(before.clientHeight);
  expect(before.touchAction).toBe("pan-y");

  const box = await index.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await page.mouse.wheel(0, 640);
  await expect.poll(() => index.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
});

test("the journey signal persists from interaction to the final composition", async ({ page }) => {
  await openPortfolio(page, "#work");
  const primaryNavigation = page.getByRole("navigation", { name: "Navigation principale" });
  const work = page.locator('[data-space="work"]');

  await work.getByLabel("Explorer les trois temps du projet").getByRole("button", { name: /Réponse/ }).click();
  await expect(work.getByText("MOUVEMENT").locator("..").getByText("20")).toBeVisible();

  await primaryNavigation.getByRole("button", { name: /Laboratoire/ }).click();
  const lab = page.locator('[data-space="lab"]');
  await lab.getByRole("slider", { name: "Comprimer la matière" }).press("End");
  await lab.getByRole("slider", { name: "Mettre le mot sous tension" }).press("End");
  await lab.getByRole("button", { name: "Propager" }).click();

  await page.getByRole("navigation", { name: "Navigation principale" }).getByRole("button", { name: /Profil/ }).click();
  await expect(page.getByText(/Trace de visite — Forme: 24; Mouvement: 30; Système: 16/)).toBeAttached();

  await page.getByRole("navigation", { name: "Navigation principale" }).getByRole("button", { name: /Contact/ }).click();
  await expect(page.getByText("TRC-IWLP-F24M30S16").first()).toBeVisible();
});

test("persistent labeled navigation connects every internal space", async ({ page }) => {
  await openPortfolio(page, "#work");
  const navigation = page.getByRole("navigation", { name: "Navigation principale" });
  const work = page.locator('[data-space="work"]');
  await work.evaluate((element) => element.scrollTo(0, element.scrollHeight));
  expect(await work.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
  await navigation.getByRole("button", { name: /Profil/ }).click();
  await expect(page).toHaveURL(/#profile$/);
  const profile = page.locator('[data-space="profile-v2"]');
  await expect(profile).toBeVisible();
  await expect.poll(() => profile.evaluate((element) => element.scrollTop)).toBe(0);
  await page.getByRole("navigation", { name: "Navigation principale" }).getByRole("button", { name: /Contact/ }).click();
  await expect(page).toHaveURL(/#contact$/);
});

test("language switching updates content and document language", async ({ page }) => {
  await openPortfolio(page, "#contact");
  await page.getByRole("button", { name: "FR" }).click();
  await page.getByRole("button", { name: "English" }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("heading", { name: /traces become a starting point/i })).toBeVisible();
});

for (const viewport of [
  { width: 320, height: 568 },
  { width: 375, height: 812 },
  { width: 768, height: 900 },
  { width: 1024, height: 900 },
  { width: 1440, height: 900 },
]) {
  test(`all spaces fit ${viewport.width}px without rail collisions or tiny targets`, async ({ page }) => {
    await page.setViewportSize(viewport);
    const spaces = [
      ["work", '[data-space="work"]'],
      ["lab", '[data-space="lab"]'],
      ["profile", '[data-space="profile-v2"]'],
      ["contact", '[data-space="contact-v2"]'],
    ] as const;

    for (const [hash, selector] of spaces) {
      await openPortfolio(page, `#${hash}`);
      const space = page.locator(selector);
      await space.waitFor();
      const geometry = await space.evaluate((element) => ({
        overflow: element.scrollWidth > element.clientWidth + 1,
        smallTargets: Array.from(element.querySelectorAll("button, a, input")).filter((target) => {
          const rect = target.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0 && (rect.height < 43 || rect.width < 43);
        }).length,
      }));
      expect(geometry, `${hash} at ${viewport.width}px`).toEqual({ overflow: false, smallTargets: 0 });

      const rail = page.getByRole("navigation", { name: "Navigation principale" });
      await expect(rail).toBeVisible();
      const collision = await page.evaluate(({ contentSelector }) => {
        const content = document.querySelector(contentSelector)?.querySelector("h1")?.getBoundingClientRect();
        const nav = Array.from(document.querySelectorAll("nav")).find((node) => node.getAttribute("aria-label") === "Navigation principale")?.getBoundingClientRect();
        if (!content || !nav || innerWidth <= 900) return false;
        return content.left < nav.right;
      }, { contentSelector: selector });
      expect(collision, `${hash} rail collision at ${viewport.width}px`).toBe(false);
    }
  });
}

test("Escape returns to the living index", async ({ page }) => {
  await openPortfolio(page, "#contact");
  await page.keyboard.press("Escape");
  await expect(page).not.toHaveURL(/#contact$/);
  await expect(page.getByRole("heading", { name: /Je construis des idées/ })).toBeVisible();
});

test("full-motion transitions and the shader report no runtime errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  await openPortfolio(page, "", false);
  await page.getByRole("button", { name: /Travaux/ }).click();
  await expect(page).toHaveURL(/#work$/);
  await expect(page.locator('[data-space="work"]')).toBeVisible();
  expect(errors.filter((error) => /shader|webgl|hydration/i.test(error))).toEqual([]);
});
