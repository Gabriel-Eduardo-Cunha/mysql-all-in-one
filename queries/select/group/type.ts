interface ExpressionObject {
	__expression?: string | Array<string>;
}

interface NoAliasObject {
	__no_alias?: SelectGroup;
}

export type SelectGroup =
	| string
	| Array<SelectGroup>
	| (ExpressionObject & NoAliasObject)
	| undefined;
