import { tokenize } from "./tokenizer.js";
import { parse } from "./parser.js";
import { emit } from "./emitter.js";

export function translate(code) {
  const tokens = tokenize(code);
  const ast = parse(tokens);
  return emit(ast);
}