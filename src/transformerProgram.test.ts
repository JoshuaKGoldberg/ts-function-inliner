/* eslint vitest/expect-expect: ["error", { "assertFunctionNames": ["expectResultTo*"] }] */
import { format } from "@prettier/sync";
import ts from "typescript";
import { describe, expect, test } from "vitest";

import { transformerProgram } from "./transformerProgram.js";

const compilerOptions: ts.CompilerOptions = {
	module: ts.ModuleKind.ESNext,
	moduleResolution: ts.ModuleResolutionKind.Node10,
	skipLibCheck: true,
	strict: true,
	target: ts.ScriptTarget.ES2021,
};

const filePath = "index.ts";

const getResult = (before: string) => {
	const sourceFile = ts.createSourceFile(
		filePath,
		before,
		ts.ScriptTarget.ESNext,
		/* setParentNodes */ true,
	);

	const fileMap = new Map<string, ts.SourceFile>([[filePath, sourceFile]]);
	const outputs: Record<string, string> = {};
	const host: ts.CompilerHost = {
		fileExists: (fileName) => fileMap.has(fileName),
		getCanonicalFileName: (fileName) => fileName,
		getCurrentDirectory: () => "",
		getDefaultLibFileName: () => "lib.d.ts",
		getDirectories: () => [],
		getNewLine: () => "\n",
		getSourceFile: (fileName) => fileMap.get(fileName),
		readFile: (fileName) => fileMap.get(fileName)?.text ?? undefined,
		useCaseSensitiveFileNames: () => true,
		writeFile: (fileName, text) => (outputs[fileName] = text),
	};
	const program = ts.createProgram([filePath], compilerOptions, host);

	program.emit(
		/* targetSourceFile */ undefined,
		host.writeFile,
		/* cancellationToken */ undefined,
		/* emitOnlyDtsFiles */ false,
		{ before: [transformerProgram(program)] },
	);

	return outputs["index.js"];
};

const normalizeFile = (text: string) =>
	format(text, { parser: "babel" }).replace(/\n+/g, "\n");

function expectResultToBe(actual: string, expected: string) {
	expect(normalizeFile(actual)).toBe(
		normalizeFile([`"use strict";`, expected].join("\n")),
	);
}

function expectResultToEndWith(actual: string, expected: string) {
	const normalized = normalizeFile(actual);

	expect(normalized.indexOf(expected)).toBeCloseTo(
		normalized.length - expected.length,
		-1,
	);
}

describe("transformerProgram", () => {
	describe("function contents", () => {
		test("BinaryExpression", () => {
			const result = getResult(`
				function addToStringLength(base: string) {
					return base.length + 3;
				}

				addToStringLength("abc");
			`);

			expectResultToBe(
				result,
				`
					function addToStringLength(base) {
						return base.length + 3;
					}

					"abc".length + 3;
				`,
			);
		});

		test("PostfixUnaryExpression", () => {
			const result = getResult(`
				function incrementCount(count: number) {
					return count++;
				}

				const value = 123;
				incrementCount(value);
			`);

			expectResultToBe(
				result,
				`
					function incrementCount(count) {
						return count++;
					}

					const value = 123;
					value++;
				`,
			);
		});

		test("PrefixUnaryExpression", () => {
			const result = getResult(`
				function isNotEmpty(text: string) {
					return !!text.length;
				}

				isNotEmpty("Boo! 👻");
			`);

			expectResultToBe(
				result,
				`
					function isNotEmpty(text) {
						return !!text.length;
					}

					!!"Boo! 👻".length;
				`,
			);
		});
	});

	describe("function kinds", () => {
		test("ArrowFunction with concise body", () => {
			const result = getResult(`
				const isNotEmpty = (text: string) => !!text.length;

				isNotEmpty("Boo! 👻");
			`);

			expectResultToEndWith(result, `!!"Boo! 👻".length;`);
		});

		test("ArrowFunction with full body", () => {
			const result = getResult(`
				const isNotEmpty = (text: string) => {
					return !!text.length;
				};

				isNotEmpty("Boo! 👻");
			`);

			expectResultToEndWith(result, `!!"Boo! 👻".length;`);
		});

		test("FunctionExpression in object property", () => {
			const result = getResult(`
				const Utils = {
					isNotEmpty: function (text: string) {
						return !!text.length;
					}
				}

				Utils.isNotEmpty("Boo! 👻");
			`);

			expectResultToEndWith(result, `!!"Boo! 👻".length;`);
		});

		test("FunctionExpression in variable", () => {
			const result = getResult(`
				const isTextNotEmpty = function (text: string) {
					return !!text.length;
				};

				isTextNotEmpty("Boo! 👻");
			`);

			expectResultToBe(
				result,
				`
					const isTextNotEmpty = function (text) {
						return !!text.length;
					};

					!!"Boo! 👻".length;
				`,
			);
		});

		test("FunctionDeclaration with a user-defined type guard", () => {
			const result = getResult(`
				function inputValueIsNotUndefined<T extends string>(input: T | undefined): input is T {
					return input !== undefined;
				}

				inputValueIsNotUndefined("");
				inputValueIsNotUndefined(undefined);
			`);

			expectResultToBe(
				result,
				`
					function inputValueIsNotUndefined(input) {
						return input !== undefined;
					}

					"" !== undefined;
					undefined !== undefined;
				`,
			);
		});
	});

	describe("size thresholds", () => {
		describe("ArrowFunction variable", () => {
			test("longer name than body", () => {
				const result = getResult(`
					const longerName = (a: number) => a + 1.2;

					longerName(3);
				`);

				expectResultToEndWith(result, "3 + 1.2");
			});

			test("shorter name than body", () => {
				const result = getResult(`
					const shorterName = (a: number) => a + 1.000000000000000002;

					shorterName(3);
				`);

				expectResultToEndWith(result, "shorterName(3);");
			});
		});

		describe("FunctionExpressions: inline", () => {
			test("longer name than body", () => {
				const result = getResult(`
					const Utils = {
						longerName: function longerName(a: number) {
							return a + 1.2;
						},
					};

					Utils.longerName(3);
				`);

				expectResultToEndWith(result, "3 + 1.2");
			});

			test("shorter name than body", () => {
				const result = getResult(`
					const Utils = {
						shorterName: function shorterName(a: number) {
							return a + 1.000000000000000002;
						},
					};

					Utils.shorterName(3);
				`);

				expectResultToEndWith(result, "Utils.shorterName(3);");
			});
		});

		describe("FunctionExpressions: method", () => {
			test("longer name than body", () => {
				const result = getResult(`
					const Utils = {
						longerName(a: number) {
							return a + 1.2;
						};
						}

					Utils.longerName(3);
				`);

				expectResultToEndWith(result, `3 + 1.2;`);
			});

			test("shorter name than body", () => {
				const result = getResult(`
					const Utils = {
						shortName(a: number) {
							return a + 1.000000000000000002;
						}
					};

					Utils.shortName(3);
				`);

				expectResultToEndWith(result, `Utils.shortName(3);`);
			});
		});

		describe("FunctionExpressions: property", () => {
			test("longer name than body", () => {
				const result = getResult(`
					const Utils = {
						longerName: function (a: number) {
							return a + 1.2;
						}
					};

					Utils.longerName(3);
				`);

				expectResultToEndWith(result, `3 + 1.2;`);
			});

			test("shorter name than body", () => {
				const result = getResult(`
					const Utils = {
						shortName: function(a: number) {
							return a + 1.000000000000000002;
						}
					};

					Utils.shortName(3);
				`);

				expectResultToEndWith(result, `Utils.shortName(3);`);
			});
		});

		describe("property FunctionDeclarations", () => {
			test("longer name than body", () => {
				const result = getResult(`
					function longerName(a: number) {
						return a + 1.2;
					}

					const Utils = { longerName: longerName };

					Utils.longerName(3);
				`);

				expectResultToEndWith(result, `3 + 1.2;`);
			});

			test("shorter name than body", () => {
				const result = getResult(`
					function shorterName(a: number) {
						return a + 1.000000000000000002;
					}

					const Utils = { shorterName: shorterName };

					Utils.shorterName(3);
				`);

				expectResultToEndWith(result, `Utils.shorterName(3);`);
			});
		});

		describe("shorthand property FunctionDeclarations", () => {
			test("longer name than body", () => {
				const result = getResult(`
					function longerName(a: number) {
						return a + 1.2;
					}
	
					const Utils = { longerName };

					Utils.longerName(3);
				`);

				expectResultToEndWith(result, `3 + 1.2;`);
			});

			test("shorter name than body", () => {
				const result = getResult(`
					function shorterName(a: number) {
						return a + 1.000000000000000002;
					}
	
					const Utils = { shorterName };
	
					Utils.shorterName(3);
				`);

				expectResultToEndWith(result, `Utils.shorterName(3);`);
			});
		});

		describe("standalone FunctionDeclarations", () => {
			test("longer name than body", () => {
				const result = getResult(`
					function longerName(a: number) {
						return a + 1.2;
					}

					longerName(3);
				`);

				expectResultToEndWith(result, `3 + 1.2;`);
			});

			test("shorter name than body", () => {
				const result = getResult(`
					function shorterName(a: number) {
						return a + 1.000000000000000002;
					}

					shorterName(3);
				`);

				expectResultToEndWith(result, `shorterName(3);`);
			});
		});
	});
});
