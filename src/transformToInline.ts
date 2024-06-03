import ts from "typescript";

import { FunctionLikeWithBody } from "./types.js";
import { getFunctionStatements } from "./getFunctionStatements.js";

/**
 * Inlines a small function declaration into a call to that function,
 * replacing parameter identifiers in the body with the call's arguments.
 */
export const transformToInline = (
	callExpression: ts.CallExpression,
	declaration: FunctionLikeWithBody,
	context: ts.TransformationContext,
) => {
	const parameters = new Map(
		declaration.parameters.map((parameterName, index) => [
			parameterName.name.getText(),
			callExpression.arguments[index],
		]),
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

	const [statement] = getFunctionStatements(declaration);

	return ts.visitNode(
		ts.isReturnStatement(statement) ? statement.expression : statement,
		visitor,
	);
};
