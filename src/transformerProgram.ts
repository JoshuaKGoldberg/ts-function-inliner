import ts from "typescript";

import { getFunctionDeclarationFromCall } from "./getFunctionDeclarationFromCall.js";
import { transformToInline } from "./transformToInline.js";

export const transformerProgram = (program: ts.Program) => {
	const transformerFactory: ts.TransformerFactory<ts.SourceFile> = (
		context,
	) => {
		return (sourceFile) => {
			const typeChecker = program.getTypeChecker();

			const visitor = (node: ts.Node): ts.Node => {
				const functionDeclaration =
					ts.isCallExpression(node) &&
					getFunctionDeclarationFromCall(node, typeChecker);

				if (functionDeclaration) {
					return transformToInline(node, functionDeclaration, context);
				}

				return ts.visitEachChild(node, visitor, context);
			};

			return ts.visitNode(sourceFile, visitor) as ts.SourceFile;
		};
	};

	return transformerFactory;
};
