#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { translate } from "../src/translator.js";

const file = process.argv[2];

if (!file) {
  console.log("Gunakake: jawa <file.jawa>");
  process.exit(1);
}

let source;
try {
  source = readFileSync(file, "utf8");
} catch (err) {
  if (err.code === "ENOENT") {
    console.error(`File ora ditemokake: ${file}`);
    process.exit(1);
  }
  console.error(`Ora bisa maca file: ${err.message}`);
  process.exit(1);
}

const js = translate(source);

try {
  new Function(js)();
} catch (err) {
  console.error(`Error: ${err.message}`);
  process.exit(1);
}