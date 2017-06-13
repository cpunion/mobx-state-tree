import { IComplexValue } from "../../core/";
import { IContext, IValidationResult } from "../type-checker";
import { IObjectChange, IObjectWillChange } from "mobx";
export declare abstract class Property {
    name: string;
    constructor(name: string);
    initializePrototype(prototype: any): void;
    initialize(targetInstance: IComplexValue, snapshot: any): void;
    willChange(change: IObjectWillChange): IObjectWillChange | null;
    didChange(change: IObjectChange): void;
    serialize(instance: IComplexValue, snapshot: any): void;
    deserialize(instance: IComplexValue, snapshot: any): void;
    abstract validate(snapshot: any, context: IContext): IValidationResult;
}
