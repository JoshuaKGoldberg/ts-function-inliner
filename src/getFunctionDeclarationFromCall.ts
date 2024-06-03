import ts from "typescript";

import { isSmallFunctionLike } from "./isSmallFunctionLike.js";

export function getFunctionDeclarationFromCall(
	node: ts.CallExpression,
	typeChecker: ts.TypeChecker,
) {
	let declaration: ts.Node | undefined = typeChecker.getSymbolAtLocation(
		node.expression,
	)?.valueDeclaration;

	if (!declaration) {
		return undefined;
	}

	if (ts.isVariableDeclaration(declaration)) {
		declaration = declaration.initializer;
	}

	if (!declaration) {
		return undefined;
	}

	if (
		ts.isPropertyAssignment(declaration) ||
		ts.isShorthandPropertyAssignment(declaration)
	) {
		declaration =
			typeChecker.getTypeAtLocation(declaration).getSymbol()
				?.valueDeclaration ?? declaration;
	}

	return isSmallFunctionLike(declaration) ? declaration : undefined;
}
