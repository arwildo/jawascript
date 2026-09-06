import { MEMBERS } from "./keywords.js";
import { JawaError } from "./tokenizer.js";

const ASSIGN_OPS = new Set(["=", "+=", "-=", "*=", "/=", "%="]);
const UNARY_OPS = new Set(["!", "-", "+"]);
const POSTFIX_OPS = new Set(["++", "--"]);

const BINARY_PRECEDENCE = new Map([
  ["||", 1],
  ["&&", 2],
  ["===", 4],
  ["!==", 4],
  ["==", 4],
  ["!=", 4],
  ["<", 5],
  [">", 5],
  ["<=", 5],
  [">=", 5],
  ["+", 6],
  ["-", 6],
  ["*", 7],
  ["/", 7],
  ["%", 7],
]);

function resolveName(name) {
  return Object.prototype.hasOwnProperty.call(MEMBERS, name) ? MEMBERS[name] : name;
}

export function parse(tokens) {
  let pos = 0;

  const peek = (offset = 0) => tokens[Math.min(pos + offset, tokens.length - 1)];
  const next = () => tokens[pos++];
  const atEnd = () => peek().type === "EOF";
  const checkValue = (v) => peek().value === v;
  const matchValue = (v) => {
    if (checkValue(v)) {
      next();
      return true;
    }
    return false;
  };
  const checkKeyword = (v) => peek().type === "Keyword" && peek().value === v;
  const operatorValue = () => {
    const t = peek();
    return t.type === "Symbol" || t.type === "Keyword" ? t.value : undefined;
  };
  const error = (msg) => {
    const t = peek();
    throw new JawaError(msg, t.line, t.col);
  };
  const expectValue = (v) => {
    if (!matchValue(v)) error(`Mengharapke "${v}"`);
  };
  const consumeSemi = () => {
    matchValue(";");
  };

  const parseProgram = () => {
    const body = [];
    while (!atEnd()) body.push(parseStatement());
    return { type: "Program", body };
  };

  const parseBlock = () => {
    expectValue("{");
    const body = [];
    while (!atEnd() && !checkValue("}")) body.push(parseStatement());
    expectValue("}");
    return { type: "Block", body };
  };

  const parseVariableDeclaration = (kind, noSemi = false) => {
    const idTok = next();
    if (idTok.type !== "Identifier") {
      error(`Sawise "${kind}" kudu ana jeneng variabel`);
    }
    const id = { type: "Identifier", name: resolveName(idTok.value) };
    let init = null;
    if (matchValue("=")) init = parseExpression();
    if (!noSemi) consumeSemi();
    return { type: "VariableDeclaration", kind, id, init };
  };

  const parseIfTail = () => {
    expectValue("(");
    const test = parseExpression();
    expectValue(")");
    const consequent = parseStatement();
    let alternate = null;
    if (checkKeyword("else if")) {
      next();
      alternate = parseIfTail();
    } else if (checkKeyword("else")) {
      next();
      alternate = parseStatement();
    }
    return { type: "IfStatement", test, consequent, alternate };
  };

  const parseIfStatement = () => {
    expectValue("if");
    return parseIfTail();
  };

  const parseWhileStatement = () => {
    expectValue("(");
    const test = parseExpression();
    expectValue(")");
    const body = parseStatement();
    return { type: "WhileStatement", test, body };
  };

  const parseForStatement = () => {
    expectValue("(");
    let init = null;
    if (checkKeyword("let") || checkKeyword("const")) {
      const kind = next().value;
      const idTok = next();
      if (idTok.type !== "Identifier") error("Kudu ana jeneng variabel");
      const id = { type: "Identifier", name: resolveName(idTok.value) };
      let value = null;
      if (matchValue("=")) value = parseExpression();
      init = { type: "VariableDeclaration", kind, id, init: value };
    } else if (!checkKeyword("of") && !checkKeyword("in") && !checkValue(";")) {
      init = parseExpression();
    }
    if (checkKeyword("of")) {
      next();
      const right = parseExpression();
      expectValue(")");
      const body = parseStatement();
      return { type: "ForOfStatement", left: init, right, body };
    }
    if (checkKeyword("in")) {
      next();
      const right = parseExpression();
      expectValue(")");
      const body = parseStatement();
      return { type: "ForInStatement", left: init, right, body };
    }
    expectValue(";");
    let test = null;
    if (!checkValue(";")) test = parseExpression();
    expectValue(";");
    let update = null;
    if (!checkValue(")")) update = parseExpression();
    expectValue(")");
    const body = parseStatement();
    return { type: "ForStatement", init, test, update, body };
  };

  const parseParams = () => {
    const params = [];
    if (!checkValue(")")) {
      do {
        const pTok = next();
        if (pTok.type !== "Identifier") {
          error("Parameter fungsi kudune identifier");
        }
        params.push({ type: "Identifier", name: resolveName(pTok.value) });
      } while (matchValue(","));
    }
    return params;
  };

  const parseFunctionDeclaration = (isAsync = false) => {
    const nameTok = next();
    if (nameTok.type !== "Identifier") {
      error("Sawise 'fungsi' kudu ana jeneng fungsi");
    }
    const name = { type: "Identifier", name: resolveName(nameTok.value) };
    expectValue("(");
    const params = parseParams();
    expectValue(")");
    const body = parseBlock();
    return { type: "FunctionDeclaration", isAsync, name, params, body };
  };

  const parseFunctionExpression = (isAsync = false) => {
    expectValue("(");
    const params = parseParams();
    expectValue(")");
    const body = parseBlock();
    return { type: "FunctionExpression", isAsync, params, body };
  };

  const parseClassDeclaration = () => {
    const nameTok = next();
    if (nameTok.type !== "Identifier") {
      error("Sawise 'kelas' kudu ana jeneng");
    }
    const name = { type: "Identifier", name: resolveName(nameTok.value) };
    let superClass = null;
    if (checkKeyword("extends")) {
      next();
      const sTok = next();
      if (sTok.type !== "Identifier") error("Sawise 'warisan' kudu ana kelas");
      superClass = { type: "Identifier", name: resolveName(sTok.value) };
    }
    expectValue("{");
    const methods = [];
    while (!atEnd() && !checkValue("}")) {
      const mTok = next();
      if (mTok.type !== "Identifier") error("Jeneng method ora valid");
      const mName = { type: "Identifier", name: resolveName(mTok.value) };
      expectValue("(");
      const mParams = parseParams();
      expectValue(")");
      const mBody = parseBlock();
      methods.push({ type: "MethodDefinition", name: mName, params: mParams, body: mBody });
    }
    expectValue("}");
    return { type: "ClassDeclaration", name, superClass, methods };
  };

  const parseSwitchStatement = () => {
    expectValue("(");
    const discriminant = parseExpression();
    expectValue(")");
    expectValue("{");
    const cases = [];
    while (!atEnd() && !checkValue("}")) {
      let test = null;
      if (checkKeyword("case")) {
        next();
        test = parseExpression();
      } else if (checkKeyword("default")) {
        next();
      } else {
        error("Ing jero switch kudune 'kasus' utawa 'asale'");
      }
      expectValue(":");
      const consequent = [];
      while (
        !atEnd() &&
        !checkValue("}") &&
        !checkKeyword("case") &&
        !checkKeyword("default")
      ) {
        consequent.push(parseStatement());
      }
      cases.push({ type: "SwitchCase", test, consequent });
    }
    expectValue("}");
    return { type: "SwitchStatement", discriminant, cases };
  };

  const parseTryStatement = () => {
    const block = parseBlock();
    let param = null;
    let handler = null;
    if (checkKeyword("catch")) {
      next();
      if (matchValue("(")) {
        const pTok = next();
        if (pTok.type !== "Identifier") error("Parameter 'nompo' kudune identifier");
        param = { type: "Identifier", name: resolveName(pTok.value) };
        expectValue(")");
      }
      handler = parseBlock();
    }
    let finalizer = null;
    if (checkKeyword("finally")) {
      next();
      finalizer = parseBlock();
    }
    return { type: "TryStatement", block, param, handler, finalizer };
  };

  const parseThrowStatement = () => {
    const argument = parseExpression();
    consumeSemi();
    return { type: "ThrowStatement", argument };
  };

  const parseReturnStatement = () => {
    let argument = null;
    if (!checkValue(";") && !checkValue("}") && !atEnd()) {
      argument = parseExpression();
    }
    consumeSemi();
    return { type: "ReturnStatement", argument };
  };

  const parseSimpleKeywordStatement = (type) => {
    consumeSemi();
    return { type };
  };

  const parseStatement = () => {
    if (checkKeyword("let")) {
      next();
      return parseVariableDeclaration("let");
    }
    if (checkKeyword("const")) {
      next();
      return parseVariableDeclaration("const");
    }
    if (checkKeyword("if")) {
      next();
      return parseIfTail();
    }
    if (checkKeyword("while")) {
      next();
      return parseWhileStatement();
    }
    if (checkKeyword("for")) {
      next();
      return parseForStatement();
    }
    if (checkKeyword("function")) {
      next();
      return parseFunctionDeclaration(false);
    }
    if (checkKeyword("async")) {
      if (peek(1).type === "Keyword" && peek(1).value === "function") {
        next();
        next();
        return parseFunctionDeclaration(true);
      }
      error("Sawise 'sambil' kudu 'fungsi'");
    }
    if (checkKeyword("class")) {
      next();
      return parseClassDeclaration();
    }
    if (checkKeyword("throw")) {
      next();
      return parseThrowStatement();
    }
    if (checkKeyword("try")) {
      next();
      return parseTryStatement();
    }
    if (checkKeyword("switch")) {
      next();
      return parseSwitchStatement();
    }
    if (checkKeyword("return")) {
      next();
      return parseReturnStatement();
    }
    if (checkKeyword("break")) {
      next();
      return parseSimpleKeywordStatement("BreakStatement");
    }
    if (checkKeyword("continue")) {
      next();
      return parseSimpleKeywordStatement("ContinueStatement");
    }
    if (checkValue("{")) {
      return parseBlock();
    }
    const expression = parseExpression();
    consumeSemi();
    return { type: "ExpressionStatement", expression };
  };

  const parsePrimary = () => {
    const tok = peek();
    if (tok.type === "Number") {
      next();
      return { type: "Literal", value: Number(tok.value) };
    }
    if (tok.type === "String") {
      next();
      return { type: "Literal", value: tok.value };
    }
    if (tok.type === "Identifier") {
      next();
      return { type: "Identifier", name: resolveName(tok.value) };
    }
    if (tok.type === "Keyword") {
      if (tok.value === "true" || tok.value === "false") {
        next();
        return { type: "Literal", value: tok.value === "true" };
      }
      if (tok.value === "null" || tok.value === "undefined") {
        next();
        return { type: "Literal", value: tok.value === "null" ? null : undefined };
      }
      if (tok.value === "this") {
        next();
        return { type: "ThisExpression" };
      }
      if (tok.value === "console.log") {
        next();
        return {
          type: "MemberExpression",
          object: { type: "Identifier", name: "console" },
          property: { type: "Identifier", name: "log" },
        };
      }
      if (tok.value === "function") {
        next();
        return parseFunctionExpression(false);
      }
      if (tok.value === "async") {
        if (peek(1).type === "Keyword" && peek(1).value === "function") {
          next();
          next();
          return parseFunctionExpression(true);
        }
        error("Sawise 'sambil' kudu 'fungsi'");
      }
      error(`Salah nganggo keyword "${tok.value}"`);
    }
    if (tok.type === "Symbol") {
      if (tok.value === "(") {
        return parseParenOrArrow();
      }
      if (tok.value === "[") {
        next();
        const elements = [];
        if (!checkValue("]")) {
          do {
            elements.push(parseExpression());
          } while (matchValue(","));
        }
        expectValue("]");
        return { type: "ArrayExpression", elements };
      }
      if (tok.value === "{") {
        next();
        return parseObjectLiteral();
      }
    }
    error("Ora ngerti expression");
  };

  const parseObjectLiteral = () => {
    const properties = [];
    while (!atEnd() && !checkValue("}")) {
      const keyTok = next();
      if (keyTok.type !== "Identifier" && keyTok.type !== "String") {
        error("Jeneng properti ora valid");
      }
      const key =
        keyTok.type === "String"
          ? { type: "Literal", value: keyTok.value }
          : { type: "Identifier", name: resolveName(keyTok.value) };
      expectValue(":");
      const value = parseExpression();
      properties.push({ type: "Property", key, value });
      if (!matchValue(",")) break;
    }
    expectValue("}");
    return { type: "ObjectExpression", properties };
  };

  const parseArrowBody = () => {
    if (checkValue("{")) return parseBlock();
    return parseExpression();
  };

  const parseParenOrArrow = () => {
    const saved = pos;
    next();
    const params = [];
    let ok = true;
    if (!checkValue(")")) {
      do {
        const t = peek();
        if (t.type !== "Identifier") {
          ok = false;
          break;
        }
        next();
        params.push({ type: "Identifier", name: resolveName(t.value) });
      } while (matchValue(","));
    }
    if (ok && checkValue(")")) {
      next();
      if (matchValue("=>")) {
        const body = parseArrowBody();
        return { type: "ArrowExpression", params, body };
      }
    }
    pos = saved;
    next();
    const expr = parseExpression();
    expectValue(")");
    return expr;
  };

  const parseNew = () => {
    let callee = parsePrimary();
    while (checkValue(".")) {
      next();
      const propTok = next();
      if (propTok.type !== "Identifier") error("Jupuk properti kudu memakai jeneng");
      callee = {
        type: "MemberExpression",
        object: callee,
        property: { type: "Identifier", name: resolveName(propTok.value) },
      };
    }
    const args = [];
    if (matchValue("(")) {
      if (!checkValue(")")) {
        do {
          args.push(parseExpression());
        } while (matchValue(","));
      }
      expectValue(")");
    }
    return { type: "NewExpression", callee, args };
  };

  const parsePostfix = () => {
    let expr = parsePrimary();
    while (true) {
      if (checkValue("(")) {
        next();
        const args = [];
        if (!checkValue(")")) {
          do {
            args.push(parseExpression());
          } while (matchValue(","));
        }
        expectValue(")");
        expr = { type: "CallExpression", callee: expr, args };
      } else if (checkValue(".")) {
        next();
        const propTok = next();
        if (propTok.type !== "Identifier") error("Jupuk properti kudu memakai jeneng");
        expr = {
          type: "MemberExpression",
          object: expr,
          property: { type: "Identifier", name: resolveName(propTok.value) },
        };
      } else if (checkValue("[")) {
        next();
        const index = parseExpression();
        expectValue("]");
        expr = { type: "MemberExpression", object: expr, property: index, computed: true };
      } else if (POSTFIX_OPS.has(operatorValue() ?? "")) {
        const op = next().value;
        expr = { type: "UpdateExpression", op, argument: expr };
      } else {
        break;
      }
    }
    return expr;
  };

  const parseUnary = () => {
    const v = operatorValue();
    if (v !== undefined && UNARY_OPS.has(v)) {
      next();
      const argument = parseUnary();
      return { type: "UnaryExpression", op: v, argument };
    }
    if (checkKeyword("await")) {
      next();
      const argument = parseUnary();
      return { type: "AwaitExpression", argument };
    }
    if (checkKeyword("new")) {
      next();
      return parseNew();
    }
    return parsePostfix();
  };

  const parseBinary = (minPrec) => {
    let left = parseUnary();
    while (true) {
      const v = operatorValue();
      const prec = v !== undefined ? BINARY_PRECEDENCE.get(v) : undefined;
      if (prec === undefined || prec < minPrec) break;
      next();
      const right = parseBinary(prec + 1);
      left = { type: "BinaryExpression", op: v, left, right };
    }
    return left;
  };

  const parseAssignment = () => {
    const left = parseBinary(0);
    if (checkValue("=>")) {
      next();
      if (left.type !== "Identifier") error("Sisih kiri saka arrow kudu param tunggal");
      const body = parseArrowBody();
      return { type: "ArrowExpression", params: [left], body };
    }
    const v = operatorValue();
    if (v !== undefined && ASSIGN_OPS.has(v)) {
      next();
      if (left.type !== "Identifier" && left.type !== "MemberExpression") {
        error("Sisih kiri saka assignment kudu variabel");
      }
      const right = parseAssignment();
      return { type: "AssignmentExpression", op: v, left, right };
    }
    return left;
  };

  const parseExpression = () => parseAssignment();

  return parseProgram();
}