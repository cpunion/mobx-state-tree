export interface ISnapshottable<S> {
}
export declare enum TypeFlags {
    String = 1,
    Number = 2,
    Boolean = 4,
    Date = 8,
    Literal = 16,
    Array = 32,
    Map = 64,
    Object = 128,
    Frozen = 256,
    Optional = 512,
    Reference = 1024,
    Identifier = 2048,
}
export interface IType<S, T> {
    name: string;
    flags: TypeFlags;
    is(thing: any): thing is S | T;
    validate(thing: any, context: IContext): IValidationResult;
    create(snapshot?: S, environment?: any): T;
    isType: boolean;
    describe(): string;
    Type: T;
    SnapshotType: S;
    instantiate(parent: Node | null, subpath: string, environment: any, initialValue?: any): Node;
    reconcile(current: Node, newValue: any): Node;
    getValue(node: Node): T;
    getSnapshot(node: Node): S;
    applySnapshot(node: Node, snapshot: S): void;
    applyPatchLocally(node: Node, subpath: string, patch: IJsonPatch): void;
    getChildren(node: Node): Node[];
    getChildNode(node: Node, key: string): Node;
    getChildType(key: string): IType<any, any>;
    removeChild(node: Node, subpath: string): void;
    isAssignableFrom(type: IType<any, any>): boolean;
}
export interface ISimpleType<T> extends IType<T, T> {
}
export interface IComplexType<S, T> extends IType<S, T & ISnapshottable<S> & IComplexValue> {
}
export declare function isType(value: any): value is IType<any, any>;
/**
 * A complex type produces a MST node (Node in the state tree)
 */
export declare abstract class ComplexType<S, T> implements IType<S, T> {
    readonly isType: boolean;
    readonly name: string;
    constructor(name: string);
    create(snapshot?: S, environment?: any): T;
    abstract instantiate(parent: Node | null, subpath: string, environment: any, initialValue: any): Node;
    abstract flags: TypeFlags;
    abstract describe(): string;
    abstract applySnapshot(node: Node, snapshot: any): void;
    abstract getDefaultSnapshot(): any;
    abstract getChildren(node: Node): Node[];
    abstract getChildNode(node: Node, key: string): Node;
    abstract getValue(node: Node): T;
    abstract getSnapshot(node: Node): any;
    abstract applyPatchLocally(node: Node, subpath: string, patch: IJsonPatch): void;
    abstract getChildType(key: string): IType<any, any>;
    abstract removeChild(node: Node, subpath: string): void;
    abstract isValidSnapshot(value: any, context: IContext): IValidationResult;
    isAssignableFrom(type: IType<any, any>): boolean;
    validate(value: any, context: IContext): IValidationResult;
    is(value: any): value is S | T;
    reconcile(current: Node, newValue: any): Node;
    readonly Type: T;
    readonly SnapshotType: S;
}
export declare abstract class Type<S, T> extends ComplexType<S, T> implements IType<S, T> {
    constructor(name: string);
    abstract instantiate(parent: Node | null, subpath: string, environment: any, initialValue: any): Node;
    getValue(node: Node): any;
    getSnapshot(node: Node): any;
    getDefaultSnapshot(): undefined;
    applySnapshot(node: Node, snapshot: S): void;
    applyPatchLocally(node: Node, subpath: string, patch: IJsonPatch): void;
    getChildren(node: Node): Node[];
    getChildNode(node: Node, key: string): Node;
    getChildType(key: string): IType<any, any>;
    reconcile(current: Node, newValue: any): Node;
    removeChild(node: Node, subpath: string): void;
}
import { IContext, IValidationResult } from "./type-checker";
import { Node, IComplexValue, IJsonPatch } from "../core";
