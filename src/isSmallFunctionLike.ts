import ts from "typescript";

import { CollectedValue, collectValue } from "./collectValue.ts";
import { getFunctionStatements } from "./getFunctionStatements.ts";
import { isFunctionWithBody } from "./isFunctionDeclarationWithBody.ts";
import { FunctionLikeWithBody } from "./types.ts";

export const isSmallFunctionLike = (
	node: ts.Node,
): node is FunctionLikeWithBody => {
	if (!isFunctionWithBody(node)) {
		return false;
	}

	if (ts.isArrowFunction(node) && ts.isExpression(node.body)) {
		return true;
	}

	const statements = getFunctionStatements(node);
	if (statements.length !== 1) {
		return false;
	}

	const [statement] = statements;
	if (!ts.isReturnStatement(statement)) {
		return false;
	}

	const { expression } = statement;
	if (!expression) {
		return false;
	}

	if (
		[
			// Case: return false;
			ts.SyntaxKind.FalseKeyword,
			// Case: return value;
			ts.SyntaxKind.Identifier,
			// Case: return value++;
			ts.SyntaxKind.PostfixUnaryExpression,
			// Case: return !!value;
			ts.SyntaxKind.PrefixUnaryExpression,
			// Case: return true;
			ts.SyntaxKind.TrueKeyword,
		].includes(expression.kind)
	) {
		return true;
	}

	if (ts.isBinaryExpression(expression)) {
		const leftValue = collectValue(expression.left);
		if (!leftValue) {
			return false;
		}

		const rightValue = collectValue(expression.right);

		return !!(
			rightValue &&
			(leftValue === CollectedValue.NameLike ||
				rightValue === CollectedValue.NameLike)
		);
	}

	return false;
};
