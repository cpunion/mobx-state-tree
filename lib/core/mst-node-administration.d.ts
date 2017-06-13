import { IType } from "../types/type";
import { IMiddleWareHandler } from "./action";
import { IDisposer } from "../utils";
import { IJsonPatch } from "./json-patch";
import { ComplexType } from "../types/complex-types/complex-type";
export declare class MSTAdministration {
    readonly nodeId: number;
    readonly target: any;
    _parent: MSTAdministration | null;
    subpath: string;
    readonly type: ComplexType<any, any>;
    isProtectionEnabled: boolean;
    _environment: any;
    _isRunningAction: boolean;
    private _isAlive;
    private _isDetaching;
    readonly middlewares: IMiddleWareHandler[];
    private readonly snapshotSubscribers;
    private readonly patchSubscribers;
    private readonly disposers;
    constructor(parent: MSTAdministration | null, subpath: string, initialState: any, type: ComplexType<any, any>, environment: any);
    /**
     * Returnes (escaped) path representation as string
     */
    readonly path: string;
    readonly isRoot: boolean;
    readonly parent: MSTAdministration | null;
    readonly root: MSTAdministration;
    readonly isAlive: boolean;
    die(): void;
    aboutToDie(): void;
    finalizeDeath(): void;
    assertAlive(): void;
    readonly snapshot: any;
    onSnapshot(onChange: (snapshot: any) => void): IDisposer;
    applySnapshot(snapshot: any): void;
    applyPatch(patch: IJsonPatch): void;
    applyPatchLocally(subpath: string, patch: IJsonPatch): void;
    onPatch(onPatch: (patches: IJsonPatch) => void): IDisposer;
    emitPatch(patch: IJsonPatch, source: MSTAdministration): void;
    setParent(newParent: MSTAdministration | null, subpath?: string | null): void;
    addDisposer(disposer: () => void): void;
    reconcileChildren<T>(childType: IType<any, T>, oldValues: T[], newValues: T[], newPaths: (string | number)[]): T[];
    resolve(pathParts: string): MSTAdministration;
    resolve(pathParts: string, failIfResolveFails: boolean): MSTAdministration | undefined;
    resolvePath(pathParts: string[]): MSTAdministration;
    resolvePath(pathParts: string[], failIfResolveFails: boolean): MSTAdministration | undefined;
    isRunningAction(): boolean;
    addMiddleWare(handler: IMiddleWareHandler): IDisposer;
    getChildMST(subpath: string): MSTAdministration | null;
    getChildMSTs(): [string, MSTAdministration][];
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
    fireHook(name: string): void;
    toString(): string;
}
