import ts from "typescript";

import { FunctionLikeWithBody } from "./types.js";

export function getFunctionStatements(node: FunctionLikeWithBody) {
	return ts.isExpression(node.body) ? [node.body] : node.body.statements;
}
