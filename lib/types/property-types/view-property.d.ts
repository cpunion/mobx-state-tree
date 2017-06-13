import { Property } from "./property";
import { IContext, IValidationResult } from "../type-checker";
export declare class ViewProperty extends Property {
    invokeView: Function;
    constructor(name: string, fn: Function);
    initialize(target: any): void;
    validate(snapshot: any, context: IContext): IValidationResult;
}
export declare function createViewInvoker(name: string, fn: Function): any;
