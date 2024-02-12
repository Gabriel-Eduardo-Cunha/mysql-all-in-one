import { escVal } from "./esc_val";
import { PreparedStatement, isPreparedStatement } from "./types";


export const generateQueryFromPreparedStatement = (
	preparedStatement: PreparedStatement
): string => {
	let { statement, values } = preparedStatement;
	if (typeof statement !== "string") return "";
	if (isPreparedStatement(statement)) return statement || "";

	statement = `${statement.split(";").join("")};`;

	const pieces = statement.split("?");
	const firstPiece = pieces.shift();
	return (
		pieces.reduce(
			(acc, cur, i) => `${acc}${escVal(values[i])}${cur}`,
			firstPiece
		) || ""
	);
};