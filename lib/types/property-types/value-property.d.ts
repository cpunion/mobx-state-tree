import { IObjectWillChange, IObjectChange } from "mobx";
import { Property } from "./property";
import { Node } from "../../core";
import { IType } from "../type";
import { IContext, IValidationResult } from "../type-checker";
export declare class ValueProperty extends Property {
    type: IType<any, any>;
    constructor(propertyName: string, type: IType<any, any>);
    initializePrototype(proto: any): void;
    initialize(instance: any, snapshot: any): void;
    getValueNode(targetInstance: any): Node;
    willChange(change: IObjectWillChange): IObjectWillChange | null;
    didChange(change: IObjectChange): void;
    serialize(instance: any, snapshot: any): void;
    deserialize(instance: any, snapshot: any): void;
    validate(snapshot: any, context: IContext): IValidationResult;
}
