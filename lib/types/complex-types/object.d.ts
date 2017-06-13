import { IObjectChange, IObjectWillChange } from "mobx";
import { IType, IComplexType, TypeFlags, ComplexType } from "../type";
import { IJsonPatch, Node } from "../../core";
import { IContext, IValidationResult } from "../type-checker";
export declare class ObjectType extends ComplexType<any, any> {
    shouldAttachNode: boolean;
    readonly flags: TypeFlags;
    /**
     * The original object definition
     */
    baseModel: any;
    baseActions: any;
    modelConstructor: new () => any;
    /**
     * Parsed description of all properties
     */
    private props;
    constructor(name: string, baseModel: Object, baseActions: Object);
    instantiate(parent: Node | null, subpath: string, environment: any, snapshot: any): Node;
    createNewInstance: () => Object;
    finalizeNewInstance: (node: Node, snapshot: any) => void;
    willChange(change: IObjectWillChange): IObjectWillChange | null;
    didChange: (change: IObjectChange) => void;
    parseModelProps(): void;
    getChildren(node: Node): Node[];
    getChildNode(node: Node, key: string): Node;
    getValue(node: Node): any;
    getSnapshot(node: Node): any;
    applyPatchLocally(node: Node, subpath: string, patch: IJsonPatch): void;
    applySnapshot(node: Node, snapshot: any): void;
    getChildType(key: string): IType<any, any>;
    isValidSnapshot(value: any, context: IContext): IValidationResult;
    private forAllProps(fn);
    describe(): string;
    getDefaultSnapshot(): any;
    removeChild(node: Node, subpath: string): void;
}
export declare type IModelProperties<T> = {
    [K in keyof T]: IType<any, T[K]> | T[K];
};
export declare type Snapshot<T> = {
    [K in keyof T]?: Snapshot<T[K]> | any;
};
export interface IModelType<T, A> extends IComplexType<Snapshot<T>, T & A> {
}
export declare function model<T>(properties: IModelProperties<T> & ThisType<T>): IModelType<T, {}>;
export declare function model<T>(name: string, properties: IModelProperties<T> & ThisType<T>): IModelType<T, {}>;
export declare function model<T, A>(properties: IModelProperties<T> & ThisType<T>, operations: A & ThisType<T & A>): IModelType<T, A>;
export declare function model<T, A>(name: string, properties: IModelProperties<T> & ThisType<T>, operations: A & ThisType<T & A>): IModelType<T, A>;
export declare function extend<A, B, AA, BA>(name: string, a: IModelType<A, AA>, b: IModelType<B, BA>): IModelType<A & B, AA & BA>;
export declare function extend<A, B, C, AA, BA, CA>(name: string, a: IModelType<A, AA>, b: IModelType<B, BA>, c: IModelType<C, CA>): IModelType<A & B & C, AA & BA & CA>;
export declare function extend<A, B, AA, BA>(a: IModelType<A, AA>, b: IModelType<B, BA>): IModelType<A & B, AA & BA>;
export declare function extend<A, B, C, AA, BA, CA>(a: IModelType<A, AA>, b: IModelType<B, BA>, c: IModelType<C, CA>): IModelType<A & B & C, AA & BA & CA>;
export declare function isObjectFactory(type: any): boolean;
