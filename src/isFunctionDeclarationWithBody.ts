import ts from "typescript";

import { FunctionLikeWithBody } from "./types.js";

export const isFunctionWithBody = (
	node: ts.Node,
): node is FunctionLikeWithBody => {
	return (
		(ts.isArrowFunction(node) ||
			ts.isFunctionDeclaration(node) ||
			ts.isFunctionExpression(node) ||
			ts.isMethodDeclaration(node)) &&
		!!node.body
	);
};
