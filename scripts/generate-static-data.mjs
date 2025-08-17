#!/usr/bin/env node
// Generate static JSON files for all API data to serve from /public/data
// This lets the app avoid serverless function execution at runtime.

import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { createClient } from "@libsql/client";

const OUT_DIR = join(process.cwd(), "public", "data");

function log(msg) {
  process.stdout.write(`[generate-static-data] ${msg}\n`);
}

function safeFileName(name) {
  // Use encodeURIComponent to mirror route URLs and keep filesystem safe
  return encodeURIComponent(name);
}

async function ensureDir(dir) {
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
}

async function writeJSON(filePath, data) {
  await ensureDir(dirname(filePath));
  await writeFile(filePath, JSON.stringify(data, null, 0));
}

function getClient() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url || !authToken) {
    throw new Error(
      "TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are required to generate static data",
    );
  }
  return createClient({ url, authToken });
}

async function run() {
  const turso = getClient();
  await ensureDir(OUT_DIR);

  // Simple tables (word + meaning or similar), no categories
  const simpleEndpoints = [
    { key: "adjectives", sql: "SELECT word, meaning FROM adjectives" },
    { key: "numbers", sql: "SELECT word, meaning FROM numbers" },
    { key: "prepositions", sql: "SELECT word, meaning FROM prepositions" },
    { key: "verbs", sql: "SELECT word, meaning FROM verbs" },
    { key: "adverbs", sql: "SELECT word, meaning, category FROM adverbs" },
    { key: "transportation", sql: "SELECT word, meaning FROM transportation" },
    { key: "colours", sql: "SELECT word, meaning FROM colours" },
    { key: "hobbies", sql: "SELECT word, meaning FROM hobbies" },
    { key: "wardrobe", sql: "SELECT word, meaning FROM wardrobe" },
    { key: "culture", sql: "SELECT word, meaning FROM culture" },
    { key: "buildings", sql: "SELECT word, meaning FROM buildings" },
  ];

  for (const { key, sql } of simpleEndpoints) {
    log(`Querying ${key}...`);
    const res = await turso.execute({ sql });
    await writeJSON(join(OUT_DIR, `${key}.json`), res.rows);
  }

  // Tables with categories and per-category breakdowns
  const grouped = [
    {
      key: "food",
      joinSql: `SELECT f.word, f.meaning, fc.name as category\n                FROM food f JOIN food_categories fc ON f.category_id = fc.id`,
      categoriesKey: "food-categories",
      categoriesSql: "SELECT id, name FROM food_categories ORDER BY name",
      perCategorySql: `SELECT f.word, f.meaning, fc.name as category\n                       FROM food f JOIN food_categories fc ON f.category_id = fc.id\n                       WHERE fc.name = ?`,
    },
    {
      key: "family",
      joinSql: `SELECT f.word, f.meaning, fc.name as category\n                FROM family f JOIN family_categories fc ON f.category_id = fc.id`,
      categoriesKey: "family-categories",
      categoriesSql: "SELECT id, name FROM family_categories ORDER BY name",
      perCategorySql: `SELECT f.word, f.meaning, fc.name as category\n                       FROM family f JOIN family_categories fc ON f.category_id = fc.id\n                       WHERE fc.name = ?`,
    },
    {
      key: "home",
      joinSql: `SELECT h.word, h.meaning, hc.name as category\n                FROM home h JOIN home_categories hc ON h.category_id = hc.id`,
      categoriesKey: "home-categories",
      categoriesSql: "SELECT id, name FROM home_categories ORDER BY name",
      perCategorySql: `SELECT h.word, h.meaning, hc.name as category\n                       FROM home h JOIN home_categories hc ON h.category_id = hc.id\n                       WHERE hc.name = ?`,
    },
    {
      key: "nature",
      joinSql: `SELECT n.word, n.meaning, nc.name as category\n                FROM nature n LEFT JOIN nature_categories nc ON n.category_id = nc.id`,
      categoriesKey: "nature-categories",
      categoriesSql: "SELECT id, name FROM nature_categories ORDER BY name",
      perCategorySql: `SELECT n.word, n.meaning, nc.name as category\n                       FROM nature n JOIN nature_categories nc ON n.category_id = nc.id\n                       WHERE nc.name = ?`,
    },
    {
      key: "ict",
      joinSql: `SELECT i.word, i.meaning, ic.name as category\n                FROM ict i LEFT JOIN ict_categories ic ON i.category_id = ic.id`,
      categoriesKey: "ict-categories",
      categoriesSql: "SELECT id, name FROM ict_categories ORDER BY name",
      perCategorySql: `SELECT i.word, i.meaning, ic.name as category\n                       FROM ict i JOIN ict_categories ic ON i.category_id = ic.id\n                       WHERE ic.name = ?`,
    },
    {
      key: "shopping",
      joinSql: `SELECT s.word, s.meaning, sc.name as category\n                FROM shopping s LEFT JOIN shopping_categories sc ON s.category_id = sc.id`,
      categoriesKey: "shopping-categories",
      categoriesSql: "SELECT id, name FROM shopping_categories ORDER BY name",
      perCategorySql: `SELECT s.word, s.meaning, sc.name as category\n                       FROM shopping s LEFT JOIN shopping_categories sc ON s.category_id = sc.id\n                       WHERE sc.name = ?`,
    },
    {
      key: "education",
      joinSql: `SELECT e.word, e.meaning, ec.name as category\n                FROM education e LEFT JOIN education_categories ec ON e.category_id = ec.id`,
      categoriesKey: "education-categories",
      categoriesSql: "SELECT id, name FROM education_categories ORDER BY name",
      perCategorySql: `SELECT e.word, e.meaning, ec.name as category\n                       FROM education e LEFT JOIN education_categories ec ON e.category_id = ec.id\n                       WHERE ec.name = ?`,
    },
    {
      key: "work",
      joinSql: `SELECT w.word, w.meaning, wc.name as category\n                FROM work w LEFT JOIN work_categories wc ON w.category_id = wc.id`,
      categoriesKey: "work-categories",
      categoriesSql: "SELECT id, name FROM work_categories ORDER BY name",
      perCategorySql: `SELECT w.word, w.meaning, wc.name as category\n                       FROM work w LEFT JOIN work_categories wc ON w.category_id = wc.id\n                       WHERE wc.name = ?`,
    },
    {
      key: "body",
      joinSql: `SELECT b.word, b.meaning, bc.name as category\n                FROM body b LEFT JOIN body_categories bc ON b.category_id = bc.id`,
      categoriesKey: "body-categories",
      categoriesSql: "SELECT id, name FROM body_categories ORDER BY name",
      perCategorySql: `SELECT b.word, b.meaning, bc.name as category\n                       FROM body b JOIN body_categories bc ON b.category_id = bc.id\n                       WHERE bc.name = ?`,
    },
  ];

  for (const g of grouped) {
    log(`Querying ${g.key} (all items)...`);
    const allRes = await turso.execute({ sql: g.joinSql });
    await writeJSON(join(OUT_DIR, `${g.key}.json`), allRes.rows);

    log(`Querying ${g.categoriesKey}...`);
    const catRes = await turso.execute({ sql: g.categoriesSql });
    await writeJSON(join(OUT_DIR, `${g.categoriesKey}.json`), catRes.rows);

    // Per-category files
    const catList = catRes.rows || [];
    const perDir = join(OUT_DIR, g.key);
    await ensureDir(perDir);
    for (const c of catList) {
      const name = c.name;
      const file = join(perDir, `${safeFileName(name)}.json`);
      log(`Querying ${g.key} category '${name}'...`);
      const pc = await turso.execute({ sql: g.perCategorySql, args: [name] });
      await writeJSON(file, pc.rows);
    }
  }

  log("Static data generation complete.");
}

run().catch((err) => {
  console.error("\nFailed to generate static data:", err?.message || err);
  process.exit(1);
});
