interface OrderObject {
	__expression?: String | Array<string>;
	[key: string]: 'asc' | 'desc' | String | Array<string> | undefined;
}

export type SelectOrder = OrderObject | undefined;
