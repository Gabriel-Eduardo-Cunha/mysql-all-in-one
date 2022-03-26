import { isExpressionObject } from "../columns/type_validators";
import { JoinObject } from "./interfaces";

export const isJoinObject = (val: any): val is JoinObject => {
	return typeof val?.table === 'string' || isExpressionObject(val);
};

