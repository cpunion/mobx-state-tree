import { ObservableMap, IMapChange, IMapWillChange } from "mobx";
import { IJsonPatch, Node } from "../../core";
import { IType, IComplexType, TypeFlags, ComplexType } from "../type";
import { IContext, IValidationResult } from "../type-checker";
export interface IExtendedObservableMap<T> extends ObservableMap<T> {
    put(value: T | any): this;
}
export declare function mapToString(this: ObservableMap<any>): string;
export declare class MapType<S, T> extends ComplexType<{
    [key: string]: S;
}, IExtendedObservableMap<T>> {
    shouldAttachNode: boolean;
    subType: IType<any, any>;
    readonly flags: TypeFlags;
    constructor(name: string, subType: IType<any, any>);
    instantiate(parent: Node | null, subpath: string, environment: any, snapshot: S): Node;
    describe(): string;
    createNewInstance: () => ObservableMap<{}>;
    finalizeNewInstance: (node: Node, snapshot: any) => void;
    getChildren(node: Node): Node[];
    getChildNode(node: Node, key: string): Node;
    willChange(change: IMapWillChange<any>): IMapWillChange<any> | null;
    private verifyIdentifier(expected, node);
    getValue(node: Node): any;
    getSnapshot(node: Node): {
        [key: string]: any;
    };
    didChange(change: IMapChange<any>): void;
    applyPatchLocally(node: Node, subpath: string, patch: IJsonPatch): void;
    applySnapshot(node: Node, snapshot: any): void;
    getChildType(key: string): IType<any, any>;
    isValidSnapshot(value: any, context: IContext): IValidationResult;
    getDefaultSnapshot(): {};
    removeChild(node: Node, subpath: string): void;
}
export declare function map<S, T>(subtype: IType<S, T>): IComplexType<{
    [key: string]: S;
}, IExtendedObservableMap<T>>;
export declare function isMapFactory<S, T>(type: any): type is IComplexType<{
    [key: string]: S;
}, IExtendedObservableMap<T>>;
