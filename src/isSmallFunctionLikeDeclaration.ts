import ts from "typescript";

import { CollectedValue, collectValue } from "./collectValue.js";
import { isFunctionDeclarationWithBody } from "./isFunctionDeclarationWithBody.js";
import { SmallFunctionLikeDeclaration } from "./types.js";

export const isSmallFunctionLikeDeclaration = (
	node: ts.Node
): node is SmallFunctionLikeDeclaration => {
	if (
		!isFunctionDeclarationWithBody(node) ||
		node.body.statements.length !== 1
	) {
		return false;
	}

	const [statement] = node.body.statements;
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
