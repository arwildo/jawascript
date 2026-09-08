const indent = (s) => s.split("\n").map((l) => "    " + l).join("\n");

const emitDeclarator = (node) =>
  `${node.kind} ${emit(node.id)}${node.init ? " = " + emit(node.init) : ""}`;

const emitBlockOrStmt = (node) =>
  node.type === "Block" ? emit(node) : `{\n${indent(emit(node))}\n}`;

export function emit(node) {
  switch (node.type) {
    case "Program":
      return node.body.map(emit).join("\n");

    case "Block":
      return `{\n${node.body.map((s) => indent(emit(s))).join("\n")}\n}`;

    case "VariableDeclaration":
      return `${emitDeclarator(node)};`;

    case "IfStatement": {
      let out = `if (${emit(node.test)}) ${emitBlockOrStmt(node.consequent)}`;
      if (node.alternate) {
        out +=
          node.alternate.type === "IfStatement"
            ? ` else ${emit(node.alternate)}`
            : ` else ${emitBlockOrStmt(node.alternate)}`;
      }
      return out;
    }

    case "WhileStatement":
      return `while (${emit(node.test)}) ${emitBlockOrStmt(node.body)}`;

    case "ForStatement": {
      const init = node.init === null ? "" : node.init.type === "VariableDeclaration" ? emitDeclarator(node.init) : emit(node.init);
      const test = node.test === null ? "" : emit(node.test);
      const update = node.update === null ? "" : emit(node.update);
      return `for (${init}; ${test}; ${update}) ${emitBlockOrStmt(node.body)}`;
    }

    case "ForOfStatement":
      return `for (${node.left.type === "VariableDeclaration" ? emitDeclarator(node.left) : emit(node.left)} of ${emit(node.right)}) ${emitBlockOrStmt(node.body)}`;

    case "ForInStatement":
      return `for (${node.left.type === "VariableDeclaration" ? emitDeclarator(node.left) : emit(node.left)} in ${emit(node.right)}) ${emitBlockOrStmt(node.body)}`;

    case "FunctionDeclaration":
      return `${node.isAsync ? "async " : ""}function ${emit(node.name)}(${node.params.map(emit).join(", ")}) ${emit(node.body)}`;

    case "FunctionExpression":
      return `${node.isAsync ? "async " : ""}function (${node.params.map(emit).join(", ")}) ${emit(node.body)}`;

    case "ArrowExpression":
      return `(${node.params.map(emit).join(", ")}) => ${emit(node.body)}`;

    case "ReturnStatement":
      return `return${node.argument ? " " + emit(node.argument) : ""};`;

    case "BreakStatement":
      return "break;";

    case "ContinueStatement":
      return "continue;";

    case "ThrowStatement":
      return `throw ${emit(node.argument)};`;

    case "TryStatement": {
      let out = `try ${emit(node.block)}`;
      if (node.handler) {
        out += ` catch${node.param ? ` (${emit(node.param)})` : ""} ${emit(node.handler)}`;
      }
      if (node.finalizer) {
        out += ` finally ${emit(node.finalizer)}`;
      }
      return out;
    }

    case "SwitchStatement": {
      const cases = node.cases
        .map((c) => {
          const label = c.test ? `case ${emit(c.test)}:` : "default:";
          const body = c.consequent.map((s) => indent(emit(s))).join("\n");
          return `${label}\n${body}`;
        })
        .join("\n");
      return `switch (${emit(node.discriminant)}) {\n${cases}\n}`;
    }

    case "ClassDeclaration": {
      const head = `class ${emit(node.name)}${node.superClass ? ` extends ${emit(node.superClass)}` : ""}`;
      const methods = node.methods.map((m) => indent(emit(m))).join("\n");
      return `${head} {\n${methods}\n}`;
    }

    case "MethodDefinition":
      return `${emit(node.name)}(${node.params.map(emit).join(", ")}) ${emit(node.body)}`;

    case "ExpressionStatement":
      return `${emit(node.expression)};`;

    case "BinaryExpression":
      return `(${emit(node.left)} ${node.op} ${emit(node.right)})`;

    case "UnaryExpression":
      return `${node.op}${emit(node.argument)}`;

    case "AssignmentExpression":
      return `${emit(node.left)} ${node.op} ${emit(node.right)}`;

    case "UpdateExpression":
      return `${emit(node.argument)}${node.op}`;

    case "CallExpression":
      return `${emit(node.callee)}(${node.args.map(emit).join(", ")})`;

    case "MemberExpression":
      if (node.computed) return `${emit(node.object)}[${emit(node.property)}]`;
      return `${emit(node.object)}.${emit(node.property)}`;

    case "ThisExpression":
      return "this";

    case "NewExpression":
      return `new ${emit(node.callee)}(${node.args.map(emit).join(", ")})`;

    case "AwaitExpression":
      return `await ${emit(node.argument)}`;

    case "Identifier":
      return node.name;

    case "ArrayExpression":
      return `[${node.elements.map(emit).join(", ")}]`;

    case "ObjectExpression":
      return `{ ${node.properties.map(emit).join(", ")} }`;

    case "Property":
      return `${emit(node.key)}: ${emit(node.value)}`;

    case "Literal":
      return typeof node.value === "string" ? JSON.stringify(node.value) : String(node.value);

    default:
      throw new Error(`Ora ngerti node: ${node.type}`);
  }
}