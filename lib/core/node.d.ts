export declare class Node {
    readonly nodeId: number;
    readonly type: IType<any, any>;
    readonly storedValue: any;
    protected _parent: Node | null;
    subpath: string;
    identifierCache: IdentifierCache | undefined;
    isProtectionEnabled: boolean;
    identifierAttribute: string | undefined;
    _environment: any;
    _isRunningAction: boolean;
    private _autoUnbox;
    private _isAlive;
    private _isDetaching;
    readonly middlewares: IMiddleWareHandler[];
    private readonly snapshotSubscribers;
    private readonly patchSubscribers;
    private readonly disposers;
    constructor(type: IType<any, any>, parent: Node | null, subpath: string, environment: any, storedValue: any);
    readonly identifier: string | null;
    /**
     * Returnes (escaped) path representation as string
     */
    readonly path: string;
    readonly isRoot: boolean;
    readonly parent: Node | null;
    readonly root: Node;
    getRelativePathTo(target: Node): string;
    resolve(pathParts: string): Node;
    resolve(pathParts: string, failIfResolveFails: boolean): Node | undefined;
    resolvePath(pathParts: string[]): Node;
    resolvePath(pathParts: string[], failIfResolveFails: boolean): Node | undefined;
    getValue(): any;
    readonly isAlive: boolean;
    die(): void;
    aboutToDie(): void;
    finalizeDeath(): void;
    assertAlive(): void;
    readonly snapshot: any;
    onSnapshot(onChange: (snapshot: any) => void): IDisposer;
    applySnapshot(snapshot: any): void;
    emitSnapshot(snapshot: any): void;
    applyPatch(patch: IJsonPatch): void;
    applyPatchLocally(subpath: string, patch: IJsonPatch): void;
    onPatch(onPatch: (patches: IJsonPatch) => void): IDisposer;
    emitPatch(patch: IJsonPatch, source: Node): void;
    setParent(newParent: Node | null, subpath?: string | null): void;
    addDisposer(disposer: () => void): void;
    reconcileChildren<T>(parent: Node, childType: IType<any, T>, oldNodes: Node[], newValues: T[], newPaths: (string | number)[]): Node[];
    isRunningAction(): boolean;
    addMiddleWare(handler: IMiddleWareHandler): IDisposer;
    getChildNode(subpath: string): Node;
    getChildren(): Node[];
    getChildType(key: string): IType<any, any>;
    readonly isProtected: boolean;
    /**
     * Pseudo action is an action that is not named, does not trigger middleware but does unlock the tree.
     * Used for applying (initial) snapshots and patches
     */
    pseudoAction(fn: () => void): void;
    assertWritable(): void;
    removeChild(subpath: string): void;
    detach(): void;
    unbox(childNode: Node): any;
    fireHook(name: string): void;
    toString(): string;
}
export interface IComplexValue {
    readonly $treenode?: Node;
}
export declare function isStateTreeNode(value: any): value is IComplexValue;
export declare function getStateTreeNode(value: IComplexValue): Node;
export declare function createNode<S, T>(type: IType<S, T>, parent: Node | null, subpath: string, environment: any, initialValue: any, createNewInstance?: (initialValue: any) => T, finalizeNewInstance?: (node: Node, initialValue: any) => void): Node;
import { IType } from "../types/type";
import { IJsonPatch } from "./json-patch";
import { IMiddleWareHandler } from "./action";
import { IDisposer } from "../utils";
import { IdentifierCache } from "./identifier-cache";
