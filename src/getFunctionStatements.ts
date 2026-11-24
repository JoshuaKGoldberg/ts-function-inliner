import ts from "typescript";

import { FunctionLikeWithBody } from "./types.ts";

export function getFunctionStatements(node: FunctionLikeWithBody) {
	return ts.isExpression(node.body) ? [node.body] : node.body.statements;
}
