import ts from "typescript";

export type MakeRequired<T, K extends keyof T> = Omit<T, K> &
	Required<Pick<T, K>>;

export type FunctionLikeWithBody = MakeRequired<
	ts.ArrowFunction | ts.FunctionDeclaration | ts.FunctionExpression,
	"body"
>;
