import { ExpressionObject } from "../types";


export type SelectGroupOrder = string | GroupArray | ExpressionObject | undefined;

type GroupArray = Array<SelectGroupOrder>;


