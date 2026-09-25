import { chromium } from "playwright";
import { mkdir, rm } from "node:fs/promises";

const baseUrl = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3001";
const output = process.env.VISUAL_SWEEP_DIR ?? "/tmp/portfolio-visual-sweep";
const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 768, height: 900 },
  { name: "mobile", width: 375, height: 812 },
];
const routes = [
  { id: "index", selector: "[data-experience-index]" },
  { id: "work", selector: '[data-space="work"]' },
  { id: "lab", selector: '[data-space="lab"]' },
  { id: "profile", selector: '[data-space="profile-v2"]' },
  { id: "contact", selector: '[data-space="contact-v2"]' },
];

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

const browser = await chromium.launch({ channel: "chrome" });
for (const viewport of viewports) {
  const context = await browser.newContext({
    locale: "fr-FR",
    viewport: { width: viewport.width, height: viewport.height },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();

  for (const route of routes) {
    const hash = route.id === "index" ? "" : `#${route.id}`;
    await page.goto(`${baseUrl}/${hash}`);
    await page.locator("[aria-busy='false']").waitFor();
    const surface = page.locator(route.selector);
    await surface.waitFor();
    await page.screenshot({ path: `${output}/${viewport.name}-${route.id}-top.png` });

    await surface.evaluate((element) => element.scrollTo(0, element.scrollHeight));
    await page.screenshot({ path: `${output}/${viewport.name}-${route.id}-bottom.png` });
  }

  await page.goto(`${baseUrl}/#work`);
  await page.locator("[aria-busy='false']").waitFor();
  const work = page.locator('[data-space="work"]');
  for (const chapter of ["Réponse", "Résultat"]) {
    await work.getByRole("button", { name: new RegExp(chapter) }).first().click();
    await work.locator("[data-case-viewport]").scrollIntoViewIfNeeded();
    await page.screenshot({ path: `${output}/${viewport.name}-work-${chapter.toLowerCase()}.png` });
  }

  await page.goto(`${baseUrl}/#profile`);
  await page.locator("[aria-busy='false']").waitFor();
  const profile = page.locator('[data-space="profile-v2"]');
  const process = profile.getByRole("navigation", { name: "Processus interactif" });
  await process.scrollIntoViewIfNeeded();
  for (const [index, step] of ["Cadrer", "Prototyper", "Donner forme", "Ingénier", "Livrer"].entries()) {
    await process.getByRole("button", { name: new RegExp(step) }).click();
    await page.screenshot({ path: `${output}/${viewport.name}-profile-step-${index + 1}.png` });
  }

  await context.close();
}
await browser.close();
process.stdout.write(`${output}\n`);
