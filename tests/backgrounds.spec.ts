import { expect, test, type Page } from "playwright/test";

test.use({ channel: "chrome", locale: "fr-FR", viewport: { width: 375, height: 812 } });
const PORTFOLIO_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3001";

async function openPortfolio(page: Page, hash = "", reducedMotion = true) {
  await page.emulateMedia({ reducedMotion: reducedMotion ? "reduce" : "no-preference" });
  await page.addInitScript(() => window.localStorage.clear());
  await page.goto(`${PORTFOLIO_URL}/${hash}`);
  await page.locator("[aria-busy='false']").waitFor();
}

test("the living index is immediately understandable without a hidden WebGL loop", async ({ page }) => {
  await openPortfolio(page);
  await expect(page.getByRole("heading", { name: /Une idée\. Mille façons/ })).toBeVisible();
  await expect(page.getByRole("main")).toHaveCount(1);
  await expect(page.locator("canvas")).toHaveCount(0);

  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Aller au contenu principal" })).toBeFocused();

  const destinations = page.locator("[data-experience-index] nav button");
  await expect(destinations).toHaveCount(4);
  await expect(destinations).toContainText(["Travaux", "Laboratoire", "Profil", "Contact"]);

  await page.getByRole("button", { name: /Laboratoire/ }).hover();
  await expect(page.locator("[data-experience-index]")).toHaveAttribute("data-preview", "lab");
  await page.locator("[data-experience-index] h1").hover();
  await expect(page.locator("[data-experience-index]")).not.toHaveAttribute("data-preview", "lab");
  const labLeaf = page.locator('[data-leaf="lab"]');
  await labLeaf.focus();
  await labLeaf.hover();
  await page.locator("[data-experience-index] h1").hover();
  await expect(labLeaf).toBeFocused();
  await expect(page.locator("[data-experience-index]")).toHaveAttribute("data-preview", "lab");

  const viewport = await page.evaluate(() => ({
    width: document.documentElement.scrollWidth,
    height: document.documentElement.scrollHeight,
    viewportWidth: innerWidth,
    viewportHeight: innerHeight,
  }));
  expect(viewport.width).toBe(viewport.viewportWidth);
  expect(viewport.height).toBe(viewport.viewportHeight);
});

test("visited status remains accessible without duplicating visual metadata", async ({ page }) => {
  await openPortfolio(page);
  await page.locator("[data-experience-index] nav button").first().click();
  await page.getByRole("button", { name: /Retour à l.index/ }).click();

  const firstDestination = page.locator("[data-experience-index] nav button").first();
  await expect(firstDestination).toHaveAccessibleName("Travaux · Exploré");
  const separated = await firstDestination.evaluate((card) => {
    const index = card.querySelector<HTMLElement>("[class*='leafTop']")?.getBoundingClientRect();
    const title = card.querySelector<HTMLElement>("[class*='destinationLabel']")?.getBoundingClientRect();
    if (!index || !title) return false;
    return index.bottom <= title.top || title.right <= index.left;
  });
  expect(separated).toBe(true);
});

test("Work frames BlueVidia as a delivered client commission", async ({ page }) => {
  await openPortfolio(page, "#work");
  await expect(page).toHaveTitle("Travaux — Etienne Mentrel");
  const work = page.locator('[data-space="work"]');
  await expect(work).toBeVisible();
  await expect(work.getByRole("heading", { name: "BlueVidia.", exact: true })).toBeVisible();
  await expect(work.getByText(/Travaux · commande client/i)).toBeVisible();
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
  await chapters.getByRole("button", { name: "Composition" }).click();
  await expect(work.getByRole("heading", { level: 2 })).toHaveText("Un parcours, plusieurs rythmes.");
  await expect(work.getByRole("img")).toHaveAttribute("src", /bluevidia-studio.jpg/);
  expect(await viewport.evaluate((element) => element.getBoundingClientRect().height)).toBeCloseTo(initialHeight, 0);

  await chapters.getByRole("button", { name: "Livraison" }).click();
  await expect(work.getByRole("heading", { level: 2 })).toHaveText("La même intention, à chaque format.");
  await expect(work.getByRole("img", { name: /au format mobile/ })).toHaveAttribute("src", /bluevidia-mobile.jpg/);
  await expect(work.getByText("Desktop / mobile", { exact: true })).toBeVisible();
  expect(await viewport.evaluate((element) => element.getBoundingClientRect().height)).toBeCloseTo(initialHeight, 0);
  await work.locator("summary").click();
  await expect(work.getByText("Design & développement", { exact: false })).toBeVisible();
});

test("three laboratory tools compose one tangible piece", async ({ page }) => {
  await openPortfolio(page, "#lab");
  const lab = page.locator('[data-space="lab"]');
  await expect(lab.getByRole("heading", { name: "À vous de plier." })).toBeVisible();
  const studies = lab.getByRole("navigation", { name: "Choisir un outil de composition" });
  await expect(studies.getByRole("button")).toHaveCount(3);
  await expect(lab.locator("article")).toHaveCount(1);
  const composition = lab.locator("[data-composition]");
  await expect(composition).toHaveCount(1);
  await expect(composition.getByRole("img", { name: /Sculpture de ruban plié/ })).toBeVisible();
  const initialShape = await composition.locator("polygon").evaluateAll((polygons) => polygons.map((polygon) => polygon.getAttribute("points")).join("|"));

  const density = lab.getByRole("slider", { name: "Plier la matière" });
  await density.press("End");
  await expect(density).toHaveValue("100");
  await expect(composition).toHaveAttribute("data-form", "100");
  expect(await composition.locator("polygon").evaluateAll((polygons) => polygons.map((polygon) => polygon.getAttribute("points")).join("|"))).not.toBe(initialShape);
  await studies.getByRole("button", { name: /Typographie/ }).click();
  const type = lab.getByRole("slider", { name: "Régler la tension" });
  await type.press("End");
  await expect(type).toHaveValue("100");
  await expect(composition).toHaveAttribute("data-tension", "100");
  await studies.getByRole("button", { name: /Système/ }).click();

  const propagate = lab.getByRole("button", { name: "Propager" });
  const route = [
    { intensity: "0.2", state: "Forme" },
    { intensity: "0.4", state: "Mouvement" },
    { intensity: "0.6", state: "Règle" },
    { intensity: "0.8", state: "Retour" },
    { intensity: "1", state: "Boucle complète" },
  ];
  for (const [index, step] of route.entries()) {
    await expect(propagate).toHaveAttribute("data-sfx-intensity", step.intensity);
    await propagate.click();
    await expect(lab.getByRole("status").filter({ hasText: step.state })).toBeVisible();
    await expect(composition).toHaveAttribute("data-phase", String(index + 1));
  }
  await expect(propagate).toHaveAttribute("data-sfx-intensity", "0");
  await propagate.click();
  await expect(lab.getByRole("status").filter({ hasText: "Origine" })).toBeVisible();
  await expect(composition).toHaveAttribute("data-phase", "0");
  await expect(propagate).toHaveAttribute("data-sfx-intensity", "0.2");

  const segments = lab.locator("[class*='systemProgress'] [data-active]");
  await expect(segments).toHaveCount(6);
  expect(await segments.evaluateAll((nodes) => nodes.filter((node) => node.getAttribute("data-active") === "true").length)).toBe(1);
});

test("a visitor can name, export and reset the composition", async ({ page }) => {
  await openPortfolio(page, "#lab");
  const lab = page.locator('[data-space="lab"]');
  await lab.getByRole("slider", { name: "Plier la matière" }).press("End");
  await lab.getByRole("button", { name: /Typographie/ }).click();
  await lab.getByRole("slider", { name: "Régler la tension" }).press("End");
  const name = lab.getByRole("textbox", { name: "Nom de la pièce" });
  await expect(name).toHaveAttribute("maxlength", "24");
  await name.fill("A < B & C");
  await expect(lab.locator("[data-composition]")).toContainText("A < B & C");
  await lab.getByRole("button", { name: /Système/ }).click();
  await lab.getByRole("button", { name: "Propager" }).click();

  const downloadPromise = page.waitForEvent("download");
  await lab.getByRole("link", { name: "Exporter en SVG" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("le-pli-100-100-2.svg");
  const stream = await download.createReadStream();
  expect(stream).not.toBeNull();
  const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
  const svg = Buffer.concat(chunks).toString("utf8");
  expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
  expect(svg).toContain("<polygon");
  expect(svg).toContain("A &lt; B &amp; C");
  expect(svg).not.toContain("<script");
  await expect(lab.getByRole("status").filter({ hasText: "Téléchargement demandé." })).toBeVisible();

  await lab.getByRole("button", { name: "Recommencer" }).click();
  await expect(lab.locator("[data-composition]")).toHaveAttribute("data-form", "42");
  await expect(lab.locator("[data-composition]")).toHaveAttribute("data-tension", "36");
  await expect(lab.locator("[data-composition]")).toHaveAttribute("data-phase", "0");
  await expect(lab.locator("[data-composition]")).toContainText("LE PLI");
  await expect(lab.getByRole("status").filter({ hasText: "Composition remise à zéro." })).toBeVisible();
  await lab.getByRole("button", { name: /Typographie/ }).click();
  await expect(name).toHaveValue("");
});

test("sound effects are controllable and persist the visitor preference", async ({ page }) => {
  await openPortfolio(page, "#lab");
  const sound = page.getByRole("button", { name: "Désactiver les effets sonores" });
  await expect(sound).toHaveAttribute("aria-pressed", "true");
  await sound.click();
  await expect(page.getByRole("button", { name: "Activer les effets sonores" })).toHaveAttribute("aria-pressed", "false");
  await expect.poll(() => page.evaluate(() => window.localStorage.getItem("portfolio:sfx-enabled"))).toBe("false");
  const nextVisit = await page.context().newPage();
  await nextVisit.goto(`${PORTFOLIO_URL}/#contact`);
  await nextVisit.locator("[aria-busy='false']").waitFor();
  await expect(nextVisit.getByRole("button", { name: "Activer les effets sonores" })).toHaveAttribute("aria-pressed", "false");
  await nextVisit.close();
});

test("the portrait stays centred in one consistent frame across breakpoints", async ({ page }) => {
  await openPortfolio(page, "#profile");
  for (const [width, portraitWidth] of [[375, 160], [768, 240], [1440, 280]]) {
    await page.setViewportSize({ width, height: 900 });
    const portrait = page.getByRole("img", { name: "Etienne Mentrel", exact: true });
    await expect(portrait).toBeVisible();
    const framing = await portrait.evaluate((image) => {
      const frame = image.parentElement!;
      return {
        position: getComputedStyle(image).objectPosition,
        fit: getComputedStyle(image).objectFit,
        width: frame.offsetWidth,
        ratio: frame.offsetWidth / frame.offsetHeight,
      };
    });
    expect(framing.position).toBe("50% 50%");
    expect(framing.fit).toBe("cover");
    expect(framing.width).toBeCloseTo(portraitWidth, 0);
    expect(framing.ratio).toBeCloseTo(4 / 5, 2);
  }
});

test("Profile makes three personal design convictions explorable", async ({ page }) => {
  await openPortfolio(page, "#profile");
  const profile = page.locator('[data-space="profile-v2"]');
  await expect(profile).toBeVisible();
  const process = profile.getByRole("navigation", { name: "Explorer mes choix de design" });
  await expect(process.getByRole("button")).toHaveCount(3);
  for (const [step, title, id] of [["Intention", "Faire ressentir quelque chose.", "intention"], ["Geste", "Donner envie de parcourir.", "gesture"], ["Précision", "Faire tenir l’ensemble.", "precision"]]) {
    await process.getByRole("button", { name: new RegExp(step) }).click();
    await expect(profile.getByRole("heading", { level: 3, name: title })).toBeVisible();
    await expect(profile).toHaveAttribute("data-profile-step", id);
    await expect(process.getByRole("button", { name: new RegExp(step) })).toHaveAttribute("aria-pressed", "true");
  }
  await expect(profile.getByRole("figure", { name: "Exemple réel du choix de design sélectionné" })).toBeVisible();
  await expect(profile.locator('[data-profile-proof="precision"] img')).toHaveAttribute("src", /bluevidia-mobile.jpg/);
});

test("Contact keeps direct actions without a session dashboard", async ({ page }) => {
  await openPortfolio(page, "#contact");
  await expect(page).toHaveTitle("Contact — Etienne Mentrel");
  const contact = page.locator('[data-space="contact-v2"]');
  await expect(contact.getByRole("link", { name: /Écrire un email/ })).toHaveAttribute("href", "mailto:etienne.mentrel@gmail.com");
  await contact.getByRole("button", { name: /Copier l’adresse email/ }).click();
  await expect(contact.getByText(/Adresse copiée|copie automatique est indisponible/).first()).toBeVisible();
  await expect(contact.getByRole("heading", { name: /La suite s’écrit\s+ensemble\./ })).toBeVisible();
  await expect(contact.getByText(/TRC-|COMPOSITION DE LA VISITE/)).toHaveCount(0);
});

test("the profile adaptation link opens the actual delivery chapter", async ({ page }) => {
  await openPortfolio(page, "#profile");
  await page.getByRole("button", { name: "Précision", exact: true }).click();
  await page.getByRole("link", { name: "Voir l’adaptation dans Travaux", exact: true }).click();
  await expect(page).toHaveURL(/#work\/delivery$/);
  await expect(page.getByRole("heading", { name: "La même intention, à chaque format.", exact: true })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Explorer les trois temps du projet" }).getByRole("button", { name: "Livraison", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.goBack();
  await expect(page.locator('[data-space="profile-v2"]')).toBeVisible();
  await page.goForward();
  await expect(page.getByRole("heading", { name: "La même intention, à chaque format.", exact: true })).toBeVisible();
});

test("the contact paper corner never covers its heading", async ({ page }) => {
  await openPortfolio(page, "#contact");
  for (const width of [768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const clearance = await page.locator('[data-space="contact-v2"]').evaluate((contact) => {
      const label = contact.querySelector("[class*='letterHeading'] span:last-child")!.getBoundingClientRect();
      const corner = contact.querySelector("[class*='letterFold']")!.getBoundingClientRect();
      return corner.left - label.right;
    });
    expect(clearance).toBeGreaterThan(16);
  }
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
  const process = page.getByRole("navigation", { name: "Explorer mes choix de design" });
  const firstPairFits = await process.getByRole("button").evaluateAll((buttons) => {
    const rail = buttons[0]?.parentElement?.getBoundingClientRect();
    const second = buttons[1]?.getBoundingClientRect();
    return Boolean(rail && second && second.right <= rail.right + 1);
  });
  expect(firstPairFits).toBe(true);

  await openPortfolio(page, "#contact");
  const contactAlignment = await page.locator('[data-space="contact-v2"]').evaluate((contact) => {
    const heading = contact.querySelector("h1")?.getBoundingClientRect();
    const email = contact.querySelector('a[href^="mailto:"]')?.getBoundingClientRect();
    return heading && email ? heading.bottom <= email.top : false;
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
    headerBackground: "rgb(8, 9, 12)",
    headerBorderWidth: "0px",
    backBackground: "rgba(0, 0, 0, 0)",
    backBorderWidth: "0px",
    backIconBackground: "rgba(0, 0, 0, 0)",
    backIconBorderRadius: "50%",
    headingOutline: "none",
  });
});

test("short mobile index remains vertically scrollable", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
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

test("the visitor composition survives tools and navigation", async ({ page }) => {
  await openPortfolio(page, "#work");
  const primaryNavigation = page.getByRole("navigation", { name: "Navigation principale" });
  const work = page.locator('[data-space="work"]');

  await work.getByLabel("Explorer les trois temps du projet").getByRole("button", { name: "Composition" }).click();

  await primaryNavigation.getByRole("button", { name: /Laboratoire/ }).click();
  const lab = page.locator('[data-space="lab"]');
  await lab.getByRole("slider", { name: "Plier la matière" }).press("End");
  await lab.getByRole("button", { name: /Typographie/ }).click();
  await lab.getByRole("slider", { name: "Régler la tension" }).press("End");
  await lab.getByRole("textbox", { name: "Nom de la pièce" }).fill("Une autre voie");
  await lab.getByRole("button", { name: /Système/ }).click();
  await lab.getByRole("button", { name: "Propager" }).click();
  await lab.getByRole("button", { name: /Matière/ }).click();
  await expect(lab.getByRole("slider", { name: "Plier la matière" })).toHaveValue("100");
  await lab.getByRole("button", { name: /Typographie/ }).click();
  await expect(lab.getByRole("slider", { name: "Régler la tension" })).toHaveValue("100");
  await expect(lab.getByRole("textbox", { name: "Nom de la pièce" })).toHaveValue("Une autre voie");
  await lab.getByRole("button", { name: /Système/ }).click();
  await expect(lab.getByRole("status").filter({ hasText: "Forme · 2/6" })).toBeVisible();

  await primaryNavigation.getByRole("button", { name: /Profil/ }).click();
  await expect(page.locator('[data-space="profile-v2"]')).toBeVisible();
  await primaryNavigation.getByRole("button", { name: /Laboratoire/ }).click();
  await expect(lab.locator("[data-composition]")).toHaveAttribute("data-form", "100");
  await expect(lab.locator("[data-composition]")).toHaveAttribute("data-tension", "100");
  await expect(lab.locator("[data-composition]")).toHaveAttribute("data-phase", "1");
  await expect(lab.locator("[data-composition]")).toContainText("Une autre voie");
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

test("browser history restores routes without discarding the visitor piece", async ({ page }) => {
  await openPortfolio(page, "#work");
  const navigation = page.getByRole("navigation", { name: "Navigation principale" });
  await navigation.getByRole("button", { name: /Laboratoire/ }).click();
  const lab = page.locator('[data-space="lab"]');
  await lab.getByRole("slider", { name: "Plier la matière" }).press("End");
  await navigation.getByRole("button", { name: /Contact/ }).click();
  await expect(page.locator('[data-space="contact-v2"]')).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(/#lab$/);
  await expect(lab).toBeVisible();
  await expect(lab.locator("[data-composition]")).toHaveAttribute("data-form", "100");
  await page.goForward();
  await expect(page).toHaveURL(/#contact$/);
  await expect(page.locator('[data-space="contact-v2"]')).toBeVisible();
  await expect(page.locator('[class*="transition"]')).toHaveCount(0);
});

test("language switching updates content and document language", async ({ page }) => {
  await openPortfolio(page, "#contact");
  await page.getByRole("button", { name: "FR" }).click();
  await page.getByRole("button", { name: "English" }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("heading", { name: /Let’s write\s+what comes next\./ })).toBeVisible();
});

test("a long composition name fits the smallest screen and its export", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await openPortfolio(page, "#lab");
  const lab = page.locator('[data-space="lab"]');
  await lab.getByRole("button", { name: /Typographie/ }).click();
  await lab.getByRole("slider", { name: "Régler la tension" }).press("End");
  await lab.getByRole("textbox", { name: "Nom de la pièce" }).fill("W".repeat(24));
  const frame = lab.locator("[data-composition]");
  expect(await frame.evaluate((element) => element.scrollWidth - element.clientWidth)).toBe(0);
  const exportLink = lab.getByRole("link", { name: "Exporter en SVG" });
  await expect(exportLink).toHaveAttribute("href", /^blob:/);
  const downloadPromise = page.waitForEvent("download");
  await exportLink.click();
  const download = await downloadPromise;
  const stream = await download.createReadStream();
  expect(stream).not.toBeNull();
  const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
  const svg = Buffer.concat(chunks).toString("utf8");
  expect(svg).toContain("W".repeat(24));
  const fontSize = Number(svg.match(/font-size="([\d.]+)" font-weight=/)?.[1]);
  expect(fontSize * 24).toBeLessThanOrEqual(640);
});

test("reset feedback follows the current language", async ({ page }) => {
  await openPortfolio(page, "#lab");
  await page.getByRole("button", { name: "Recommencer" }).click();
  await page.getByRole("button", { name: "FR", exact: true }).click();
  await page.getByRole("button", { name: "English", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "Composition reset." })).toBeVisible();
  await expect(page.getByText("Composition remise à zéro.")).toHaveCount(0);
});

test("sculpting in the laboratory becomes the contact signature", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openPortfolio(page, "#lab");
  const sculpt = page.getByRole("slider", { name: "Plier la matière" });
  await sculpt.press("End");
  await expect(sculpt).toHaveValue("100");
  const sculpture = page.locator("[data-composition] [data-fold-signature]");
  const points = await sculpture.locator("polygon").evaluateAll((nodes) => nodes.map((node) => node.getAttribute("points")));
  const navigation = page.getByRole("navigation", { name: "Navigation principale" });
  await navigation.getByRole("button", { name: "Contact", exact: true }).click();
  await expect(page.getByText("Signée par votre pli", { exact: true })).toBeVisible();
  const signature = page.locator('[data-space="contact-v2"] [data-fold-signature]');
  expect(await signature.locator("polygon").evaluateAll((nodes) => nodes.map((node) => node.getAttribute("points")))).toEqual(points);
});

test("the BlueVidia landmarks are an optional stable inspection", async ({ page }) => {
  await openPortfolio(page, "#work");
  await page.getByRole("navigation", { name: "Explorer les trois temps du projet" }).getByRole("button", { name: "Composition", exact: true }).click();
  const viewport = page.locator("[data-case-viewport]");
  const height = await viewport.evaluate((element) => element.getBoundingClientRect().height);
  await page.getByRole("button", { name: "Voir les repères", exact: true }).click();
  await expect(page.getByRole("button", { name: "Masquer les repères", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#bluevidia-capture-guide")).toHaveAttribute("data-visible", "true");
  expect(await viewport.evaluate((element) => element.getBoundingClientRect().height)).toBeCloseTo(height, 1);
  await page.getByRole("button", { name: "Masquer les repères", exact: true }).click();
  await expect(page.locator("#bluevidia-capture-guide")).toHaveAttribute("data-visible", "false");
});

test("each delivered interface has inspectable real composition landmarks", async ({ page }) => {
  await openPortfolio(page, "#work");
  const chapters = page.getByRole("navigation", { name: "Explorer les trois temps du projet" });
  const frame = page.locator("[data-case-frame]");
  for (const [chapter, choices] of [
    ["Intention", [["Nom", "identity"], ["Menu", "navigation"], ["Accès", "access"]]],
    ["Composition", [["Texte", "text"], ["Image", "image"], ["Crédit", "credit"]]],
    ["Livraison", [["Desktop", "desktop"], ["Mobile", "mobile"]]],
  ] as const) {
    await chapters.getByRole("button", { name: chapter, exact: true }).click();
    await expect(frame).toHaveAttribute("data-case-inspection", "interface");
    await page.getByRole("button", { name: "Voir les repères", exact: true }).click();
    for (const [name, state] of choices) {
      await page.getByRole("group", { name: "Lire les choix de composition" }).getByRole("button", { name, exact: true }).click();
      await expect(frame).toHaveAttribute("data-case-inspection", state);
      await expect(page.locator("#bluevidia-inspector-description")).not.toBeEmpty();
    }
    await page.getByRole("button", { name: "Masquer les repères", exact: true }).click();
    await expect(frame).toHaveAttribute("data-case-inspection", "interface");
  }
});

test("the folio preview keeps the laboratory piece across routes", async ({ page }) => {
  await openPortfolio(page, "#lab");
  await page.getByRole("slider", { name: "Plier la matière" }).press("End");
  await page.getByRole("button", { name: /Typographie/ }).click();
  await page.getByRole("slider", { name: "Régler la tension" }).press("End");
  await page.getByRole("button", { name: /Système/ }).click();
  await page.getByRole("button", { name: "Propager", exact: true }).click();
  const index = page.locator("[data-experience-index]");
  const points = await page.locator("[data-composition] polygon").evaluateAll((nodes) => nodes.map((node) => node.getAttribute("points")));
  const nav = page.getByRole("navigation", { name: "Navigation principale" });
  await nav.getByRole("button", { name: "Profil", exact: true }).click();
  await page.getByRole("button", { name: "Geste", exact: true }).click();
  expect(await page.locator('[data-profile-proof="gesture"] polygon').evaluateAll((nodes) => nodes.map((node) => node.getAttribute("points")))).toEqual(points);
  await nav.getByRole("button", { name: "Index", exact: true }).click();
  await expect(page.getByRole("heading", { name: /Une idée\. Mille façons/ })).toBeFocused();
  expect(await index.locator('[data-leaf="lab"] polygon').evaluateAll((nodes) => nodes.map((node) => node.getAttribute("points")))).toEqual(points);
  await expect(page.locator("[data-route-surface]")).toHaveCount(1);
});

test("BlueVidia chapters and inspection keep the page height stable", async ({ page }) => {
  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await openPortfolio(page, "#work");
    const work = page.locator('[data-space="work"]');
    const chapterNavigation = page.getByRole("navigation", { name: "Explorer les trois temps du projet" });
    const heights: number[] = [];
    for (const name of ["Intention", "Composition", "Livraison"]) {
      await chapterNavigation.getByRole("button", { name, exact: true }).click();
      heights.push(await work.evaluate((element) => element.scrollHeight));
      if (name === "Composition") {
        await page.getByRole("button", { name: "Voir les repères", exact: true }).click();
        heights.push(await work.evaluate((element) => element.scrollHeight));
        await page.getByRole("button", { name: "Masquer les repères", exact: true }).click();
      }
    }
    expect(Math.max(...heights) - Math.min(...heights), `Chapter jump at ${width}px`).toBeLessThanOrEqual(1);
  }
});

test("laboratory tools keep a stable frame on small screens", async ({ page }) => {
  for (const width of [320, 375]) {
    await page.setViewportSize({ width, height: 812 });
    await openPortfolio(page, "#lab");
    const lab = page.locator('[data-space="lab"]');
    const heights: number[] = [];
    for (const name of [/Matière/, /Typographie/, /Système/]) {
      await lab.getByRole("button", { name }).click();
      heights.push(await lab.locator("[data-composition]").evaluate((element) => element.parentElement!.getBoundingClientRect().height));
    }
    expect(Math.max(...heights) - Math.min(...heights)).toBeLessThan(1);
  }
});

test("skip navigation focuses the content without changing the current route", async ({ page }) => {
  await openPortfolio(page, "#work");
  await page.getByRole("link", { name: "Aller au contenu principal" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("main")).toBeFocused();
  await expect(page).toHaveURL(/#work$/);
  await expect(page.locator('[data-space="work"]')).toBeVisible();
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
      ["", "[data-experience-index]"],
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

      const smallHeaderTargets = await page.locator("#main-experience > header").evaluate((header) => Array.from(header.querySelectorAll("button")).filter((button) => {
        const rect = button.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && (rect.width < 43 || rect.height < 43);
      }).length);
      expect(smallHeaderTargets).toBe(0);

      if (hash === "") continue;

      const rail = page.getByRole("navigation", { name: "Navigation principale" });
      await expect(rail).toBeVisible();
      const collision = await page.evaluate(({ contentSelector }) => {
        const content = document.querySelector(contentSelector)?.getBoundingClientRect();
        const nav = Array.from(document.querySelectorAll("nav")).find((node) => node.getAttribute("aria-label") === "Navigation principale")?.getBoundingClientRect();
        if (!content || !nav) return true;
        return content.bottom > nav.top;
      }, { contentSelector: selector });
      expect(collision, `${hash} rail collision at ${viewport.width}px`).toBe(false);
    }
  });
}

test("Escape returns to the living index", async ({ page }) => {
  await openPortfolio(page, "#contact");
  await page.keyboard.press("Escape");
  await expect(page).not.toHaveURL(/#contact$/);
  await expect(page.getByRole("heading", { name: /Une idée\. Mille façons/ })).toBeVisible();
});

test("full-motion navigation reports no runtime errors or blocking overlay", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  await openPortfolio(page, "", false);
  await page.getByRole("button", { name: /Travaux/ }).click();
  await expect(page).toHaveURL(/#work$/);
  await expect(page.locator('[data-space="work"]')).toBeVisible();
  await expect(page.locator('[class*="transition"]')).toHaveCount(0);
  await expect(page.locator("[data-route-surface]")).toHaveCount(1);
  expect(errors).toEqual([]);
});
