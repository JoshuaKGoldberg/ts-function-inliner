import ts from "typescript";

import { isSmallFunctionLikeDeclaration } from "./isSmallFunctionLikeDeclaration.js";
import { transformToInline } from "./transformToInline.js";
import { SmallFunctionLikeDeclaration } from "./types.js";

export const transformerProgram = (program: ts.Program) => {
	const transformerFactory: ts.TransformerFactory<ts.SourceFile> = (
		context,
	) => {
		return (sourceFile) => {
			const typeChecker = program.getTypeChecker();

			const getDeclarationToInline = (
				node: ts.CallExpression,
			): SmallFunctionLikeDeclaration | undefined => {
				const declaration = typeChecker.getSymbolAtLocation(node.expression)
					?.valueDeclaration;

				return declaration && isSmallFunctionLikeDeclaration(declaration)
					? declaration
					: undefined;
			};

			const visitor = (node: ts.Node): ts.Node => {
				if (ts.isCallExpression(node)) {
					const functionDeclaration = getDeclarationToInline(node);
					if (functionDeclaration) {
						const result = transformToInline(
							node,
							functionDeclaration,
							context,
						);
						return result;
					}
				}

				return ts.visitEachChild(node, visitor, context);
			};

			return ts.visitNode(sourceFile, visitor) as ts.SourceFile;
		};
	};

	return transformerFactory;
};
