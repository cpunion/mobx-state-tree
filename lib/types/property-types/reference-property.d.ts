import { Property } from "./property";
import { IType } from "../type";
import { IContext, IValidationResult } from "../type-checker";
export declare class ReferenceProperty extends Property {
    private type;
    private basePath;
    constructor(propertyName: string, type: IType<any, any>, basePath: string);
    initialize(targetInstance: any, snapshot: any): void;
    serialize(instance: any, snapshot: any): void;
    deserialize(instance: any, snapshot: any): void;
    validate(value: any, context: IContext): IValidationResult;
}
