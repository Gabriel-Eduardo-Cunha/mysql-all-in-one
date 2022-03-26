import create_conditions from "./create_conditions";
import { ConditionOptions } from "./types";

const where = (opts: ConditionOptions, alias?: string): string => {
    return `WHERE ${create_conditions(
        opts,
        alias
    )}`;
};

export default where