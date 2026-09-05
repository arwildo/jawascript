const KEYWORDS = [
  ["yen ora", "else"],
  ["yen", "if"],
  ["tampilno", "console.log"],
  ["ono", "let"],
  ["tetep", "const"],
  ["fungsi", "function"],
  ["balekno", "return"],
  ["bener", "true"],
  ["salah", "false"],
  ["suwung", "null"],
  ["kanggo", "for"],
  ["suwene", "while"],
  ["lakoni", "do"],
  ["mandheg", "break"],
  ["terusi", "continue"],
  ["kelas", "class"],
  ["anyar", "new"],
  ["coba", "try"],
  ["cekel", "catch"],
  ["pungkasan", "finally"],
  ["uncalno", "throw"],
];

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function translate(code) {
  const placeholders = [];

  // Proteksi string literal lan komentar supaya ora katut diganti keyword
  const maskedCode = code.replace(
    /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\/\/[^\n]*|\/\*[\s\S]*?\*\/)/g,
    (match) => {
      placeholders.push(match);
      return `__JAWA_PLACEHOLDER_${placeholders.length - 1}__`;
    }
  );

  let js = maskedCode;

  for (const [from, to] of KEYWORDS) {
    const regex = new RegExp(`\\b${escapeRegex(from)}\\b`, "g");
    js = js.replace(regex, to);
  }

  return js.replace(/__JAWA_PLACEHOLDER_(\d+)__/g, (_, index) => placeholders[Number(index)]);
}