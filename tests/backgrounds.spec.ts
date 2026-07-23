import { expect, test } from "playwright/test";
import sharp from "sharp";

test.use({
  channel: "chrome",
  viewport: { width: 375, height: 812 },
});

async function openPortfolio(page: import("playwright/test").Page): Promise<void> {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("http://127.0.0.1:3000");
  await page.getByText("HI, I'M ETIENNE MENTREL").waitFor({ state: "visible" });
}

async function scrollToConstellations(page: import("playwright/test").Page): Promise<void> {
  await page.evaluate(() => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo(0, maxScroll * 0.5);
  });
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      }),
  );
}

test("Given the Genesis hero, when it renders, then the background is the only WebGL canvas", async ({ page }) => {
  await openPortfolio(page);

  await expect(page.locator("canvas")).toHaveCount(1);
});

test("Given the italic surname, when its reveal settles, then its glyphs are not clipped", async ({ page }) => {
  await openPortfolio(page);

  const surname = page.getByText("MENTREL", { exact: true });
  const wrapperOverflow = await surname.evaluate((element) => {
    const wrapper = element.parentElement;
    return wrapper === null ? "missing" : getComputedStyle(wrapper).overflow;
  });

  expect(wrapperOverflow).toBe("visible");
});

test("Given the desktop skills section, when it renders, then every skill is named without interaction", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openPortfolio(page);
  await scrollToConstellations(page);

  const skillNames = await page.locator("[data-skill-item]").allTextContents();

  expect(skillNames).toEqual([
    "React / Next.js",
    "Three.js / R3F",
    "Tailwind CSS",
    "Node.js / Express",
    "Python / Django",
    "AWS / Docker",
    "CI / CD",
  ]);
});

test("Given a skill label, when the pointer hovers it, then the label remains stationary", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openPortfolio(page);
  await scrollToConstellations(page);

  const skill = page.locator('[data-skill-item="React / Next.js"]');
  const before = await skill.boundingBox();
  await skill.hover();
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      }),
  );
  const after = await skill.boundingBox();

  expect(before).not.toBeNull();
  expect(after).not.toBeNull();
  if (before === null || after === null) return;
  expect(after.x).toBe(before.x);
  expect(after.y).toBe(before.y);
});

test("Given the language selector, when the locale changes, then the resume opens the matching language", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openPortfolio(page);

  const resumeLink = page.locator("[data-resume-link]");
  await expect(resumeLink).toHaveAttribute(
    "href",
    "https://cvdesignr.com/p/67c9a21b5458a?hl=fr_FR",
  );

  await page.getByRole("button", { name: "EN", exact: true }).click();
  await page.getByRole("button", { name: "Français" }).click();

  await expect(resumeLink).toHaveAttribute(
    "href",
    "https://cvdesignr.com/p/647b251d89bf4?hl=fr_FR",
  );
  await expect(resumeLink).toHaveText(/Voir mon CV/);
});

test("Given Act III on mobile, when the background renders, then the Act I protostar is absent", async ({ page }) => {
  await openPortfolio(page);
  await page.evaluate(() => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo(0, maxScroll * 0.85);
  });
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      }),
  );

  const screenshot = await page.screenshot();
  const { data, info } = await sharp(screenshot)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let pinkPixels = 0;
  for (let index = 0; index < data.length; index += info.channels) {
    const red = data[index];
    const green = data[index + 1];
    const blue = data[index + 2];
    if (red > 120 && red > green * 1.2 && red > blue * 1.1) {
      pinkPixels += 1;
    }
  }

  expect(pinkPixels).toBeLessThan(10_000);
});

test("Given a 375px viewport, when the HUD renders, then navigation stays inside the frame", async ({ page }) => {
  await openPortfolio(page);

  const box = await page.locator("nav").boundingBox();

  expect(box).not.toBeNull();
  if (box === null) return;
  expect(box.x).toBeGreaterThanOrEqual(12);
  expect(box.x + box.width).toBeLessThanOrEqual(363);
});

test("Given the mobile scroll track, when Signal begins, then its content section starts at the two-thirds boundary", async ({ page }) => {
  await openPortfolio(page);

  const track = page.locator("main");
  const signal = page.locator("section#act-3");
  const [trackHeight, signalTop] = await Promise.all([
    track.evaluate((element) => element.getBoundingClientRect().height),
    signal.evaluate((element) => element.getBoundingClientRect().top + window.scrollY),
  ]);

  expect(trackHeight).toBe(5_684);
  expect(signalTop).toBe(3_248);
});

test("Given Constellations on mobile, when progress reaches its midpoint, then About and Skills remain fully visible without Projects overlapping", async ({ page }) => {
  await openPortfolio(page);
  await scrollToConstellations(page);

  const aboutHeading = page.locator("#act-2 h3").first();
  const skillsHeading = page.locator("#act-2 h2").last();
  const firstProject = page.locator("#act-3 .project-row").first();
  const [aboutBox, skillsBox, projectBox] = await Promise.all([
    aboutHeading.boundingBox(),
    skillsHeading.boundingBox(),
    firstProject.boundingBox(),
  ]);

  expect(aboutBox).not.toBeNull();
  expect(skillsBox).not.toBeNull();
  expect(projectBox).not.toBeNull();
  if (aboutBox === null || skillsBox === null || projectBox === null) return;
  expect(aboutBox.y).toBeGreaterThanOrEqual(64);
  expect(skillsBox.y + skillsBox.height).toBeLessThanOrEqual(748);
  expect(projectBox.y).toBeGreaterThanOrEqual(812);
});

test("Given the end of the mobile scroll track, when the user reaches the bottom, then the contact actions are reachable", async ({ page }) => {
  await openPortfolio(page);
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      }),
  );

  const [emailBox, resumeBox] = await Promise.all([
    page.locator('#act-3 a[href^="mailto:"]').boundingBox(),
    page.locator("[data-resume-link]").boundingBox(),
  ]);

  expect(emailBox).not.toBeNull();
  expect(resumeBox).not.toBeNull();
  if (emailBox === null || resumeBox === null) return;
  expect(emailBox.y).toBeGreaterThanOrEqual(0);
  expect(emailBox.y + emailBox.height).toBeLessThanOrEqual(812);
  expect(resumeBox.y).toBeGreaterThanOrEqual(0);
  expect(resumeBox.y + resumeBox.height).toBeLessThanOrEqual(812);
});

test("Given the Signal transmission, when it is fully visible, then its cyan energy stays in a precise narrow beam", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openPortfolio(page);
  await page.evaluate(() => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo(0, maxScroll * 0.78);
  });
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      }),
  );

  const screenshot = await page.screenshot();
  const { data, info } = await sharp(screenshot)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let minimumX = info.width;
  let maximumX = 0;
  const startX = Math.floor(info.width * 0.3);
  const endX = Math.ceil(info.width * 0.7);
  const startY = Math.floor(info.height * 0.08);
  const endY = Math.ceil(info.height * 0.62);

  for (let y = startY; y < endY; y += 1) {
    for (let x = startX; x < endX; x += 1) {
      const index = (y * info.width + x) * info.channels;
      const red = data[index];
      const green = data[index + 1];
      const blue = data[index + 2];
      if (blue > 40 && green > 30 && blue > red * 1.1) {
        minimumX = Math.min(minimumX, x);
        maximumX = Math.max(maximumX, x);
      }
    }
  }

  expect(maximumX - minimumX).toBeLessThan(40);
});

test("Given the project list, when the rows render, then each row links to its GitHub repository", async ({ page }) => {
  await openPortfolio(page);

  const destinations = await page.locator("#act-3 .project-row").evaluateAll((rows) =>
    rows.map((row) => row.getAttribute("href")),
  );

  expect(destinations).toEqual([
    "https://github.com/H1B0B0/Eclatshop",
    "https://github.com/H1B0B0/Time-manager",
    "https://github.com/H1B0B0/Kurama-chat",
    "https://github.com/H1B0B0/Rogue-like-LibGDX",
    "https://github.com/H1B0B0/twitch-Viewerbot",
    "https://github.com/H1B0B0/Kick-Viewerbot",
  ]);
});

test("Given the cinematic shaders, when the page loads, then WebGL reports no shader errors", async ({ page }) => {
  const shaderErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error" && message.text().includes("Shader Error")) {
      shaderErrors.push(message.text());
    }
  });

  await openPortfolio(page);

  expect(shaderErrors).toEqual([]);
});
