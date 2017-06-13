import { Node } from "../../core";
import { TypeFlags, Type, IType } from "../type";
import { IContext, IValidationResult } from "../type-checker";
export interface IReference {
    $ref: string;
}
export declare type ReferenceSnapshot = string | null | IReference;
export declare class ReferenceType<T> extends Type<ReferenceSnapshot, T> {
    private readonly targetType;
    readonly flags: TypeFlags;
    constructor(targetType: IType<any, T>);
    describe(): string;
    getValue(node: Node): any;
    getSnapshot(node: Node): any;
    instantiate(parent: Node | null, subpath: string, environment: any, snapshot: any): Node;
    reconcile(current: Node, newValue: any): Node;
    isAssignableFrom(type: IType<any, any>): boolean;
    isValidSnapshot(value: any, context: IContext): IValidationResult;
}
export declare function reference<T>(factory: IType<any, T>): IType<string | number, T>;
export declare function isReferenceType(type: any): type is ReferenceType<any>;
