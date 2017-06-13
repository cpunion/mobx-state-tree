import { ISimpleType, TypeFlags, Type } from "../type";
import { IContext, IValidationResult } from "../type-checker";
import { Node } from '../../core';
export declare class Frozen<T> extends Type<T, T> {
    flags: TypeFlags;
    constructor();
    describe(): string;
    instantiate(parent: Node | null, subpath: string, environment: any, value: any): Node;
    isValidSnapshot(value: any, context: IContext): IValidationResult;
}
export declare const frozen: ISimpleType<any>;
