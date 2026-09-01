import { chromium } from "playwright-core";

const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:3000";
const routes = ["/", "/work/", "/about/", "/contact/"];
const viewports = [
  { name: "phone", width: 375, height: 812 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1280, height: 800 },
];

const browser = await chromium.launch({ channel: "chrome", headless: true });
const findings = [];

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    const consoleErrors = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });

    for (const route of routes) {
      await page.goto(new URL(route, baseUrl).href, { timeout: 15_000, waitUntil: "domcontentloaded" });
      await page.waitForTimeout(900);

      const result = await page.evaluate(() => {
        const root = document.documentElement;
        const viewportWidth = root.clientWidth;
        const visible = (element) => {
          const style = getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
        };
        const label = (element) => {
          if (typeof element.className !== "string") return element.tagName.toLowerCase();
          const className = element.className.trim().split(/\s+/).slice(0, 2).join(".");
          return className ? `${element.tagName.toLowerCase()}.${className}` : element.tagName.toLowerCase();
        };

        const fixedOverflow = Array.from(document.querySelectorAll("body *"))
          .filter(visible)
          .filter((element) => {
            const rect = element.getBoundingClientRect();
            const style = getComputedStyle(element);
            return style.position === "fixed" && (rect.left < -2 || rect.right > viewportWidth + 2);
          })
          .map(label);

        const brokenImages = Array.from(document.images)
          .filter((image) => image.complete && image.naturalWidth === 0)
          .map((image) => image.currentSrc || image.src);

        const unnamedButtons = Array.from(document.querySelectorAll("button"))
          .filter(visible)
          .filter((button) => !(button.getAttribute("aria-label") || button.textContent?.trim()))
          .map(label);

        const dock = document.querySelector(".sound-dock")?.getBoundingClientRect();
        const progress = document.querySelector(".sound-progress")?.getBoundingClientRect();

        return {
          brokenImages,
          documentOverflow: root.scrollWidth > viewportWidth + 2,
          fixedOverflow,
          playerProgressOverflow: Boolean(dock && progress && (progress.left < dock.left - 1 || progress.right > dock.right + 1)),
          unnamedButtons,
        };
      });

      findings.push({
        consoleErrors: [...consoleErrors],
        route,
        viewport: viewport.name,
        ...result,
      });
      consoleErrors.length = 0;
    }

    await context.close();
  }
} finally {
  await browser.close();
}

const failures = findings.filter((finding) => (
  finding.documentOverflow
  || finding.playerProgressOverflow
  || finding.fixedOverflow.length
  || finding.brokenImages.length
  || finding.unnamedButtons.length
  || finding.consoleErrors.length
));

console.table(findings.map((finding) => ({
  route: finding.route,
  viewport: finding.viewport,
  horizontalOverflow: finding.documentOverflow ? "FAIL" : "PASS",
  playerProgress: finding.playerProgressOverflow ? "FAIL" : "PASS",
  brokenImages: finding.brokenImages.length,
  unnamedButtons: finding.unnamedButtons.length,
  consoleErrors: finding.consoleErrors.length,
})));

if (failures.length) {
  console.error("\nResponsive audit failed:\n", JSON.stringify(failures, null, 2));
  process.exitCode = 1;
} else {
  console.log("\nResponsive audit passed for every route and viewport.");
}
