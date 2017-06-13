import { IType, Type } from "../type";
import { IContext, IValidationResult } from "../type-checker";
/**
 * A complex type produces a MST node (Node in the state tree)
 */
export declare abstract class ComplexType<S, T> extends Type<S, T> {
    constructor(name: string);
    create(snapshot?: any, environment?: any, parent?: MSTAdministration | null, subpath?: string): any;
    abstract createNewInstance(): any;
    abstract finalizeNewInstance(target: any, snapshot: any): void;
    abstract applySnapshot(node: MSTAdministration, snapshot: any): void;
    abstract getDefaultSnapshot(): any;
    abstract getChildMSTs(node: MSTAdministration): [string, MSTAdministration][];
    abstract getChildMST(node: MSTAdministration, key: string): MSTAdministration | null;
    abstract serialize(node: MSTAdministration): any;
    abstract applyPatchLocally(node: MSTAdministration, subpath: string, patch: IJsonPatch): void;
    abstract getChildType(key: string): IType<any, any>;
    abstract removeChild(node: MSTAdministration, subpath: string): void;
    abstract isValidSnapshot(value: any, context: IContext): IValidationResult;
    validate(value: any, context: IContext): IValidationResult;
}
import { MSTAdministration } from "../../core/mst-node-administration";
import { IJsonPatch } from "../../core/json-patch";
