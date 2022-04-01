
export type SqlValues = String | Date | null | boolean | number;

export const isSqlValues = (val:any):val is SqlValues => val === null || (["string", "boolean", "number", "object"].includes(typeof val) && !Array.isArray(val) && (typeof val !== "object" || val instanceof Date)) 


