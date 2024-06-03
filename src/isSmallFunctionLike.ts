import ts from "typescript";

import { CollectedValue, collectValue } from "./collectValue.js";
import { isFunctionWithBody } from "./isFunctionDeclarationWithBody.js";
import { SmallFunctionLikeWithBody } from "./types.js";

export const isSmallFunctionLike = (
	node: ts.Node,
): node is SmallFunctionLikeWithBody => {
	if (!isFunctionWithBody(node) || node.body.statements.length !== 1) {
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
