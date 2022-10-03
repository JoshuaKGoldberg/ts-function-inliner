import ts from "typescript";

export type MakeRequired<T, K extends keyof T> = Omit<T, K> &
	Required<Pick<T, K>>;

export type FunctionDeclarationWithBody = MakeRequired<
	ts.FunctionDeclaration,
	"body"
>;

export type SmallFunctionLikeDeclaration = ts.FunctionDeclaration & {
	body: {
		statements: [MakeRequired<ts.ReturnStatement, "expression">];
	};
};
