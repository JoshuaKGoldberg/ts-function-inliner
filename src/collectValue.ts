import ts from "typescript";

export enum CollectedValue {
	PropertyAccess = "property-access",
	NameLike = "name-like",
}

export const collectValue = (node: ts.Node): CollectedValue | undefined => {
	if (
		node.kind === ts.SyntaxKind.FalseKeyword ||
		node.kind === ts.SyntaxKind.NullKeyword ||
		node.kind === ts.SyntaxKind.TrueKeyword ||
		ts.isStringLiteralLike(node) ||
		ts.isNumericLiteral(node) ||
		ts.isBigIntLiteral(node) ||
		(ts.isIdentifier(node) && node.text === "undefined")
	) {
		return CollectedValue.NameLike;
	}

	if (ts.isIdentifier(node)) {
		return CollectedValue.NameLike;
	}

	if (ts.isPropertyAccessExpression(node)) {
		if (!ts.isIdentifier(node.name)) {
			return undefined;
		}

		if (ts.isIdentifier(node.expression)) {
			return CollectedValue.PropertyAccess;
		}

		if (ts.isPropertyAccessExpression(node.expression)) {
			return collectValue(node.expression) === CollectedValue.PropertyAccess
				? CollectedValue.PropertyAccess
				: undefined;
		}
	}

	return undefined;
};
