import test from "node:test";
import assert from "node:assert/strict";
import { translate } from "../src/translator.js";

test("nerjemahno keyword dasar Jawa", () => {
  const jawa = `
    ono x = 10;
    tetep y = 20;
    yen (x < y) {
      tampilno("bener");
    } yen ora {
      tampilno("salah");
    }
  `;
  const expected = `
    let x = 10;
    const y = 20;
    if (x < y) {
      console.log("bener");
    } else {
      console.log("salah");
    }
  `;
  assert.equal(translate(jawa).trim(), expected.trim());
});

test("nerjemahno fungsi lan balekno", () => {
  const jawa = `
    fungsi ping(a, b) {
      balekno a * b;
    }
  `;
  const expected = `
    function ping(a, b) {
      return a * b;
    }
  `;
  assert.equal(translate(jawa).trim(), expected.trim());
});

test("nerjemahno perulangan (kanggo, suwene, mandheg)", () => {
  const jawa = `
    kanggo (ono i = 0; i < 5; i++) {
      yen (i == 3) mandheg;
    }
    ono n = 0;
    suwene (n < 3) {
      n++;
    }
  `;
  const expected = `
    for (let i = 0; i < 5; i++) {
      if (i == 3) break;
    }
    let n = 0;
    while (n < 3) {
      n++;
    }
  `;
  assert.equal(translate(jawa).trim(), expected.trim());
});

test("ora ngganti keyword ing njero string literal utawa komentar", () => {
  const jawa = `
    // komentar yen ora ganti
    tampilno("ono yen ora bener");
  `;
  const expected = `
    // komentar yen ora ganti
    console.log("ono yen ora bener");
  `;
  assert.equal(translate(jawa).trim(), expected.trim());
});
