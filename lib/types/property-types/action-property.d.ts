import { Property } from "./property";
import { IContext, IValidationResult } from "../type-checker";
export declare class ActionProperty extends Property {
    invokeAction: Function;
    constructor(name: string, fn: Function);
    initialize(target: any): void;
    validate(snapshot: any, context: IContext): IValidationResult;
}
