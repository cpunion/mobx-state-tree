import { ISimpleType, TypeFlags, Type } from "../type";
import { IContext, IValidationResult } from "../type-checker";
import { Node } from "../../core";
export declare class Literal<T> extends Type<T, T> {
    readonly value: any;
    readonly flags: TypeFlags;
    constructor(value: any);
    instantiate(parent: Node | null, subpath: string, environment: any, snapshot: T): Node;
    describe(): string;
    isValidSnapshot(value: any, context: IContext): IValidationResult;
}
export declare function literal<S>(value: S): ISimpleType<S>;
