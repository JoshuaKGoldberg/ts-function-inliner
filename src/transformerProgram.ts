import { CachedFactory } from "cached-factory";
import ts from "typescript";

import { getFunctionDeclarationFromCall } from "./getFunctionDeclarationFromCall.ts";
import { getFunctionStatements } from "./getFunctionStatements.ts";
import { transformToInline } from "./transformToInline.ts";
import { FunctionLikeWithBody } from "./types.ts";

export const transformerProgram = (program: ts.Program) => {
	const transformerFactory: ts.TransformerFactory<ts.SourceFile> = (
		context,
	) => {
		return (sourceFile) => {
			const typeChecker = program.getTypeChecker();

			const functionDeclarationLengths = new CachedFactory(
				(node: FunctionLikeWithBody) => {
					const statements = getFunctionStatements(node);
					return statements[0].getText(sourceFile).length - "return".length;
				},
			);

			const getFunctionDeclarationForReplacement = (
				node: ts.CallExpression,
			) => {
				const functionDeclaration = getFunctionDeclarationFromCall(
					node,
					typeChecker,
				);

				return (
					functionDeclaration &&
					functionDeclarationLengths.get(functionDeclaration) <=
						node.getText(sourceFile).length &&
					functionDeclaration
				);
			};

			const visitor = (node: ts.Node): ts.Node => {
				const functionDeclaration =
					ts.isCallExpression(node) &&
					getFunctionDeclarationForReplacement(node);

				if (functionDeclaration) {
					const transformed = transformToInline(
						node,
						functionDeclaration,
						context,
					);

					if (transformed) {
						return transformed;
					}
				}

				return ts.visitEachChild(node, visitor, context);
			};

			return ts.visitNode(sourceFile, visitor) as ts.SourceFile;
		};
	};

	return transformerFactory;
};
