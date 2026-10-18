// Sends the dashboard's texts (messages/*.json) to the backend, so new texts exist in the database for every language.
// Run it after a deploy:  API_URL=... TRANSLATIONS_SYNC_EMAIL=... TRANSLATIONS_SYNC_PASSWORD=... npm run translations:sync
// The account needs the SuperAdmin, Admin or Translator role.
import { readFileSync } from "node:fs";
import { join } from "node:path";

const apiUrl = process.env.API_URL ?? "http://localhost:5076";
const email = process.env.TRANSLATIONS_SYNC_EMAIL;
const password = process.env.TRANSLATIONS_SYNC_PASSWORD;
if (!email || !password) {
  console.error("Set TRANSLATIONS_SYNC_EMAIL and TRANSLATIONS_SYNC_PASSWORD.");
  process.exit(1);
}

const flatten = (object, prefix = "") =>
  Object.entries(object).reduce((result, [key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof value === "string" ? { ...result, [path]: value } : { ...result, ...flatten(value, path) };
  }, {});
const read = (language) => flatten(JSON.parse(readFileSync(join(import.meta.dirname, "..", "messages", `${language}.json`), "utf8")));

async function call(path, body, token) {
  const response = await fetch(`${apiUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) },
    body: JSON.stringify(body),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`${path}: ${response.status} ${(result.errorMessage ?? []).join(", ")}`);
  return result.data;
}

const { accessToken } = await call("/api/auth/login", { email, password });
const result = await call("/api/translations/sync", { scope: "ui", keys: read("en"), translations: { de: read("de"), tr: read("tr") } }, accessToken);
console.log(`ui texts: ${result.total} in code, ${result.added} new, ${result.sourceChanged} changed, ${result.markedUnused} no longer used, ${result.pending} waiting for translation.`);
