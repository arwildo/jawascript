const KEYWORDS = [
  ["yen ora", "else"],
  ["yen", "if"],
  ["tampilno", "console.log"],
  ["ono", "let"],
  ["teks dadi integer", "parseInt"],
  ["teks dadi desimal", "parseFloat"],
  ["tetep", "const"],
  ["fungsi", "function"],
  ["balekno", "return"],
  ["nalikane", "while"],
  ["kanggo", "for"],
  ["mandheg", "break"],
  ["terusno", "continue"],
  ["lan", "&&"],
  ["utawa", "||"],
  ["padha karo", "==="],
  ["ora padha", "!=="],
  ["gedhe padha", ">="],
  ["cilik padha", "<="],
  ["gedhe", ">"],
  ["cilik", "<"],
  ["bener", "true"],
  ["salah", "false"],
  ["kosong", "null"],
  ["ora ono", "undefined"],
  ["coba", "try"],
  ["tangkap", "catch"],
  ["pungkasan", "finally"],
  ["uncalno", "throw"],
  ["pilih", "switch"],
  ["kasus", "case"],
  ["standar", "default"],
  ["kelas", "class"],
  ["waris", "extends"],
  ["konstruktor", "constructor"],
  ["anyar", "new"],
];

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const SORTED_KEYWORDS = [...KEYWORDS].sort(
  ([a], [b]) => b.length - a.length
);

const KEYWORD_REGEX = new RegExp(
  `(?<![A-Za-z0-9_])(?:${SORTED_KEYWORDS
    .map(([from]) => escapeRegex(from))
    .join("|")})(?![A-Za-z0-9_])`,
  "g"
);

function replaceKeywords(text) {
  return text.replace(KEYWORD_REGEX, (match) => {
    const keyword = SORTED_KEYWORDS.find(
      ([from]) => from === match
    );

    return keyword ? keyword[1] : match;
  });
}

export function translate(code) {
  let output = "";
  let buffer = "";

  let i = 0;
  let state = "code";

  function flushBuffer() {
    if (buffer.length > 0) {
      output += replaceKeywords(buffer);
      buffer = "";
    }
  }

  while (i < code.length) {
    const char = code[i];
    const next = code[i + 1];

    if (state === "code") {
      if (char === '"' || char === "'" || char === "`") {
        flushBuffer();

        state = char;
        output += char;

        i++;
        continue;
      }

      if (char === "/" && next === "/") {
        flushBuffer();

        state = "line-comment";
        output += "//";

        i += 2;
        continue;
      }

      if (char === "/" && next === "*") {
        flushBuffer();

        state = "block-comment";
        output += "/*";

        i += 2;
        continue;
      }

      buffer += char;
      i++;
      continue;
    }

    if (state === '"' || state === "'" || state === "`") {
      output += char;

      if (char === "\\") {
        if (next !== undefined) {
          output += next;
          i += 2;
          continue;
        }
      }

      if (char === state) {
        state = "code";
      }

      i++;
      continue;
    }

    if (state === "line-comment") {
      output += char;

      if (char === "\n") {
        state = "code";
      }

      i++;
      continue;
    }

    if (state === "block-comment") {
      output += char;

      if (char === "*" && next === "/") {
        output += "/";
        state = "code";
        i += 2;
        continue;
      }

      i++;
      continue;
    }
  }

  flushBuffer();

  return output;
}