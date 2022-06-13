const obj: SelectOrder = {
	hi: 'asc',
	__no_alias: { hello: 'asc' },
};

interface OrderObject {
	__expression?:
		| String
		| Array<string | Record<string, any>>
		| Record<string, any>;
	__no_alias?: SelectOrder;
	[key: string]:
		| 'asc'
		| 'desc'
		| String
		| Array<string | Record<string, any>>
		| SelectOrder
		| Record<string, any>
		| undefined;
}

export const isSelectOrder = (val: any): val is SelectOrder =>
	typeof val === 'object';

export type SelectOrder = OrderObject | undefined;
