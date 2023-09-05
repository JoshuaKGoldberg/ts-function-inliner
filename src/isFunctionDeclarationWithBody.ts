import ts from "typescript";

import { FunctionDeclarationWithBody } from "./types.js";

export const isFunctionDeclarationWithBody = (
	node: ts.Node,
): node is FunctionDeclarationWithBody => {
	return ts.isFunctionDeclaration(node) && !!node.body;
};
