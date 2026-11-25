import assert from "node:assert/strict";
import {
  cpSync,
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
  mkdirSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { execFileSync } from "node:child_process";

for (const file of [
  "dist/index.js",
  "dist/index.d.ts",
  "dist/axios.js",
  "dist/axios.d.ts",
])
  assert.ok(existsSync(file), `${file} missing`);
const root = await import("vue-query-request-utils");
const axios = await import("vue-query-request-utils/axios");
assert.equal(typeof root.createHttpClient, "function");
assert.equal(typeof root.useGet, "function");
assert.equal(typeof axios.createAxiosAdapter, "function");
for (const file of [
  "dist/index.js",
  ...[
    ...readFileSync("dist/index.js", "utf8").matchAll(/from "(\.\/[^\"]+)"/g),
  ].map((match) => `dist/${match[1].slice(2)}`),
]) {
  assert.doesNotMatch(readFileSync(file, "utf8"), /from ["']axios["']/);
}
for (const file of [
  "dist/index.d.ts",
  "dist/compatibility/legacy.d.ts",
  "dist/core/transport/axios.d.ts",
]) {
  assert.doesNotMatch(readFileSync(file, "utf8"), /from ["']axios["']/);
}

const temp = mkdtempSync(join(tmpdir(), "vqr-exports-"));
try {
  const modules = join(temp, "node_modules");
  const pkg = join(modules, "vue-query-request-utils");
  mkdirSync(join(modules, "@tanstack"), { recursive: true });
  mkdirSync(pkg);
  cpSync("dist", join(pkg, "dist"), { recursive: true });
  writeFileSync(join(pkg, "package.json"), readFileSync("package.json"));
  symlinkSync(resolve("node_modules/vue"), join(modules, "vue"), "dir");
  symlinkSync(
    resolve("node_modules/@tanstack/vue-query"),
    join(modules, "@tanstack/vue-query"),
    "dir",
  );
  assert.equal(existsSync(join(modules, "axios")), false);
  execFileSync(
    process.execPath,
    [
      "--input-type=module",
      "-e",
      "import('vue-query-request-utils').then(m => { if (typeof m.createHttpClient !== 'function') process.exit(1) })",
    ],
    { cwd: temp, stdio: "pipe" },
  );
} finally {
  rmSync(temp, { recursive: true, force: true });
}
console.log("Package exports and Axios-free root import verified");
