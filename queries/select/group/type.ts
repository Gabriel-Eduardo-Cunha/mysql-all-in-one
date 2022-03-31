interface ExpressionObject {
	__expression?: string | Array<string>;
}

export type SelectGroup =
	| string
	| Array<SelectGroup>
	| ExpressionObject
	| undefined;
