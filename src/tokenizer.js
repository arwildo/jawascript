import { KEYWORDS } from "./keywords.js";

const KEYWORDS_SORTED = [...KEYWORDS]
  .map(([jawa, js]) => ({ jawa, js }))
  .sort((a, b) => b.jawa.length - a.jawa.length);

const SYMBOLS = [
  "===",
  "!==",
  "<=",
  ">=",
  "==",
  "!=",
  "&&",
  "||",
  "+=",
  "-=",
  "*=",
  "/=",
  "%=",
  "++",
  "--",
  "=>",
  "(",
  ")",
  "{",
  "}",
  "[",
  "]",
  ",",
  ";",
  ":",
  ".",
  "=",
  "+",
  "-",
  "*",
  "/",
  "%",
  "<",
  ">",
  "!",
];

const SYMBOLS_SORTED = [...SYMBOLS].sort((a, b) => b.length - a.length);

export class JawaError extends Error {
  constructor(message, line = null, col = null) {
    super(message);
    this.name = "JawaError";
    this.line = line;
    this.col = col;
  }
}

const isIdentPart = (c) => c !== undefined && /[A-Za-z0-9_$]/.test(c);

export function tokenize(source) {
  const tokens = [];
  let i = 0;
  let line = 1;
  let col = 1;

  const advance = (n = 1) => {
    for (let k = 0; k < n; k++) {
      if (source[i] === "\n") {
        line++;
        col = 1;
      } else {
        col++;
      }
      i++;
    }
  };

  while (i < source.length) {
    const ch = source[i];
    const startLine = line;
    const startCol = col;

    if (/\s/.test(ch)) {
      advance();
      continue;
    }

    if (ch === "/" && source[i + 1] === "/") {
      while (i < source.length && source[i] !== "\n") advance();
      continue;
    }

    if (ch === "/" && source[i + 1] === "*") {
      advance(2);
      while (i < source.length && !(source[i] === "*" && source[i + 1] === "/")) advance();
      if (i >= source.length) throw new JawaError("Komentar durung rampung", startLine, startCol);
      advance(2);
      continue;
    }

    let matched = false;
    for (const { jawa, js } of KEYWORDS_SORTED) {
      if (source.startsWith(jawa, i)) {
        const before = i > 0 ? source[i - 1] : "";
        const after = source[i + jawa.length] ?? "";
        if (!isIdentPart(before) && !isIdentPart(after)) {
          tokens.push({ type: "Keyword", value: js, line: startLine, col: startCol });
          advance(jawa.length);
          matched = true;
          break;
        }
      }
    }
    if (matched) continue;

    if (ch === '"' || ch === "'") {
      const quote = ch;
      advance();
      let value = "";
      let closed = false;
      while (i < source.length) {
        const c = source[i];
        if (c === "\\") {
          advance();
          const esc = source[i];
          if (esc === "n") value += "\n";
          else if (esc === "t") value += "\t";
          else if (esc === "r") value += "\r";
          else if (esc === quote || esc === "\\") value += esc;
          else value += "\\" + esc;
          advance();
        } else if (c === quote) {
          advance();
          closed = true;
          break;
        } else {
          value += c;
          advance();
        }
      }
      if (!closed) throw new JawaError("String durung rampung", startLine, startCol);
      tokens.push({ type: "String", value, line: startLine, col: startCol });
      continue;
    }

    if (/[0-9]/.test(ch)) {
      let num = "";
      while (i < source.length && /[0-9]/.test(source[i])) {
        num += source[i];
        advance();
      }
      if (source[i] === "." && /[0-9]/.test(source[i + 1] ?? "")) {
        num += ".";
        advance();
        while (i < source.length && /[0-9]/.test(source[i])) {
          num += source[i];
          advance();
        }
      }
      tokens.push({ type: "Number", value: num, line: startLine, col: startCol });
      continue;
    }

    if (isIdentPart(ch) && !/[0-9]/.test(ch)) {
      let name = "";
      while (i < source.length && isIdentPart(source[i])) {
        name += source[i];
        advance();
      }
      tokens.push({ type: "Identifier", value: name, line: startLine, col: startCol });
      continue;
    }

    let sym = null;
    for (const s of SYMBOLS_SORTED) {
      if (source.startsWith(s, i)) {
        sym = s;
        break;
      }
    }
    if (sym) {
      tokens.push({ type: "Symbol", value: sym, line: startLine, col: startCol });
      advance(sym.length);
      continue;
    }

    throw new JawaError(`Karakter ora dikenal: '${ch}'`, startLine, startCol);
  }

  tokens.push({ type: "EOF", value: null, line, col });
  return tokens;
}