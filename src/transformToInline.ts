import ts from "typescript";

import { SmallFunctionLikeDeclaration } from "./types.js";

/**
 * Inlines a small function declaration into a call to that function,
 * replacing parameter identifiers in the body with the call's arguments.
 */
export const transformToInline = (
	callExpression: ts.CallExpression,
	declaration: SmallFunctionLikeDeclaration,
	context: ts.TransformationContext
) => {
	const parameters = new Map(
		declaration.parameters.map((parameterName, index) => [
			parameterName.name.getText(),
			callExpression.arguments[index],
		])
	);

	const visitor = (node: ts.Node): ts.Node => {
		if (ts.isIdentifier(node)) {
			const correspondingParameter = parameters.get(node.text);
			if (correspondingParameter) {
				return ts.visitNode(correspondingParameter, visitor);
			}
		}

		return ts.visitEachChild(node, visitor, context);
	};

	return ts.visitNode(declaration.body.statements[0].expression, visitor);
};
