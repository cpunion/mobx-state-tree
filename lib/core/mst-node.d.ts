import { IType } from "../types/type";
export interface IMSTNode {
    readonly $treenode?: MSTAdministration;
}
export declare function getType<S, T>(object: IMSTNode): IType<S, T>;
export declare function getChildType(object: IMSTNode, child: string): IType<any, any>;
export declare function isMST(value: any): value is IMSTNode;
export declare function getMSTAdministration(value: any): MSTAdministration;
/**
 * Tries to convert a value to a TreeNode. If possible or already done,
 * the first callback is invoked, otherwise the second.
 * The result of this function is the return value of the callbacks, or the original value if the second callback is omitted
 */
export declare function maybeMST<T, R>(value: T & IMSTNode, asNodeCb: (node: MSTAdministration, value: T) => R, asPrimitiveCb?: (value: T) => R): R;
export declare function valueToSnapshot(thing: any): any;
export declare function getRelativePathForNodes(base: MSTAdministration, target: MSTAdministration): string;
import { MSTAdministration } from "./mst-node-administration";
