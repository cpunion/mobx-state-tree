import { IMSTNode } from "./mst-node";
import { IType } from "../types/type";
export interface IReference {
    $ref: string;
}
export declare class Reference {
    private owner;
    private type;
    private basePath;
    private targetIdAttribute;
    identifier: string | null;
    constructor(owner: IMSTNode, type: IType<any, any>, basePath: string, identifier: string);
    readonly get: any;
    setNewValue(value: any): void;
    serialize(): string | IReference | null;
}
