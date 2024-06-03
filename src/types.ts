import ts from "typescript";

export type MakeRequired<T, K extends keyof T> = Omit<T, K> &
	Required<Pick<T, K>>;

export type FunctionLikeWithBody = MakeRequired<
	ts.FunctionDeclaration | ts.FunctionExpression,
	"body"
>;

export type SmallFunctionLikeWithBody = FunctionLikeWithBody & {
	body: {
		statements: [MakeRequired<ts.ReturnStatement, "expression">];
	};
};
