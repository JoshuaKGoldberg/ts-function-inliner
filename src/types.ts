import ts from "typescript";

export type FunctionLikeWithBody = MakeRequired<
	ts.ArrowFunction | ts.FunctionDeclaration | ts.FunctionExpression,
	"body"
>;

export type MakeRequired<T, K extends keyof T> = Omit<T, K> &
	Required<Pick<T, K>>;
