const obj: SelectOrder = {
	hi: 'asc',
	__no_alias: { hello: 'asc' },
};

interface OrderObject {
	__expression?: String | Array<string>;
	__no_alias?: SelectOrder;
	[key: string]:
		| 'asc'
		| 'desc'
		| String
		| Array<string>
		| SelectOrder
		| undefined;
}

export const isSelectOrder = (val: any): val is SelectOrder =>
	typeof val === 'object';

export type SelectOrder = OrderObject | undefined;
