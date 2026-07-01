// Merges per-subject staging files (src/data/raw/*.json) into the published
// src/data/bank.json that the live app reads from.
//
// Staging file schema (one question per entry):
//   { "subject": "Biology", "difficulty": "medium", "year": "2021",
//     "question": "...", "options": { "A": "...", "B": "...", "C": "...", "D": "..." },
//     "answer": "B", "explanation": "..." }
//
// Run with: npm run build:bank

import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'src', 'data');
const rawDir = path.join(dataDir, 'raw');
const bankPath = path.join(dataDir, 'bank.json');

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

function slugify(subject) {
  return subject.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const existingBank = readJson(bankPath);
const existingTexts = new Set(existingBank.map((q) => `${q.subject}::${q.text.trim().toLowerCase()}`));

const rawFiles = readdirSync(rawDir).filter((f) => f.endsWith('.json'));

let added = 0;
const merged = [...existingBank];

for (const file of rawFiles) {
  const subjectSlug = file.replace(/\.json$/, '');
  const entries = readJson(path.join(rawDir, file));

  entries.forEach((entry, index) => {
    const subject = entry.subject?.trim();
    if (!subject) {
      throw new Error(`${file}[${index}] is missing a "subject" field`);
    }
    const text = entry.question?.trim();
    if (!text) {
      throw new Error(`${file}[${index}] is missing a "question" field`);
    }
    if (!entry.explanation?.trim()) {
      throw new Error(`${file}[${index}] ("${text.slice(0, 40)}...") has no explanation`);
    }

    const key = `${subject}::${text.toLowerCase()}`;
    if (existingTexts.has(key)) return; // already published, skip duplicate

    merged.push({
      id: `raw-${subjectSlug}-${index}`,
      university: 'RSU',
      year: String(entry.year ?? 'General'),
      subject,
      topic: entry.topic ?? '',
      difficulty: entry.difficulty ?? 'medium',
      type: 'single',
      text,
      options: { A: '', B: '', C: '', D: '', E: '', ...entry.options },
      answer: entry.answer,
      explanation: entry.explanation,
    });
    existingTexts.add(key);
    added += 1;
  });
}

writeFileSync(bankPath, JSON.stringify(merged, null, 2) + '\n');
console.log(`Added ${added} new question(s) from src/data/raw/*.json into bank.json (total: ${merged.length}).`);
