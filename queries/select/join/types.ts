import { AliasObject } from "../conditionals/interfaces";
import { ExpressionObject } from "../interfaces";
import { JoinObject } from "./interfaces";


export type JoinTable = string | (ExpressionObject & AliasObject);
export type JoinType = 'inner' | 'left' | 'right';
export type SelectJoin = JoinObject | Array<JoinObject> | undefined;
