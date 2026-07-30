import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("contains the complete FitFKR product source", async () => {
  const [page, layout, manifest, readme] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../public/manifest.webmanifest", import.meta.url), "utf8"),
    readFile(new URL("../README.md", import.meta.url), "utf8"),
  ]);
  assert.match(layout, /FitFKR/);
  assert.match(page, /Paste your workout plan/);
  assert.match(page, /Vial measurement/);
  assert.match(page, /Blush Pink/);
  assert.match(page, /Export backup/);
  assert.equal(JSON.parse(manifest).name, "FitFKR");
  assert.match(readme, /npm run build/);
});

test("build emits a worker and required public assets exist", async () => {
  await Promise.all([
    access(new URL("../dist/server/index.js", import.meta.url)),
    access(new URL("../public/sw.js", import.meta.url)),
    access(new URL("../public/icon-192.png", import.meta.url)),
    access(new URL("../public/icon-512.png", import.meta.url)),
  ]);
});
