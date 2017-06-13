import { ISimpleType, TypeFlags, Type } from "./type";
import { IContext, IValidationResult } from "./type-checker";
import { Node } from "../core";
export declare class CoreType<T> extends Type<T, T> {
    readonly checker: (value: any) => boolean;
    readonly flags: TypeFlags;
    constructor(name: any, flags: TypeFlags, checker: any);
    describe(): string;
    instantiate(parent: Node | null, subpath: string, environment: any, snapshot: T): Node;
    isValidSnapshot(value: any, context: IContext): IValidationResult;
}
export declare const string: ISimpleType<string>;
export declare const number: ISimpleType<number>;
export declare const boolean: ISimpleType<boolean>;
export declare const DatePrimitive: ISimpleType<Date>;
export declare function getPrimitiveFactoryFromValue(value: any): ISimpleType<any>;
export declare function isPrimitiveType(type: any): type is CoreType<any>;
