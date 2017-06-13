import { IType } from "../types/type";
import { Node } from "./node";
export declare class IdentifierCache {
    private cache;
    constructor();
    addNodeToCache(node: Node): this;
    mergeCache(node: Node): void;
    notifyDied(node: Node): void;
    splitCache(node: Node): IdentifierCache;
    resolve(type: IType<any, any>, identifier: string): Node | null;
}
