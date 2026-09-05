const KEYWORDS = [
  ["yen ora", "else"],
  ["yen", "if"],
  ["tampilno", "console.log"],
  ["ono", "let"],
  ["teks dadi integer", "parseInt"],
  ["teks dadi desimal", "parseFloat"],
];

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function translate(code) {
  let js = code;

  for (const [from, to] of KEYWORDS) {
    const regex = new RegExp(`\\b${escapeRegex(from)}\\b`, "g");
    js = js.replace(regex, to);
  }

  return js;
}