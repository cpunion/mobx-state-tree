import { Type, IType } from "../type";
import { IContext, IValidationResult } from "../type-checker";
import { Node } from "../../core";
export declare type IFunctionReturn<T> = () => T;
export declare type IOptionalValue<S, T> = S | T | IFunctionReturn<S> | IFunctionReturn<T>;
export declare class OptionalValue<S, T> extends Type<S, T> {
    readonly type: IType<S, T>;
    readonly defaultValue: IOptionalValue<S, T>;
    readonly flags: number;
    constructor(type: IType<S, T>, defaultValue: IOptionalValue<S, T>);
    describe(): string;
    instantiate(parent: Node, subpath: string, environment: any, value: S): Node;
    reconcile(current: Node, newValue: any): Node;
    private getDefaultValue();
    isValidSnapshot(value: any, context: IContext): IValidationResult;
}
export declare function optional<S, T>(type: IType<S, T>, defaultValueOrFunction: S): IType<S, T>;
export declare function optional<S, T>(type: IType<S, T>, defaultValueOrFunction: T): IType<S, T>;
export declare function optional<S, T>(type: IType<S, T>, defaultValueOrFunction: () => S): IType<S, T>;
export declare function optional<S, T>(type: IType<S, T>, defaultValueOrFunction: () => T): IType<S, T>;
