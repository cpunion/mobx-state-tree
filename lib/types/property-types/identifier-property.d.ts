import { ValueProperty } from "./value-property";
import { IType } from "../type";
export declare class IdentifierProperty extends ValueProperty {
    subtype: IType<any, any>;
    constructor(propertyName: string, subtype: IType<any, any>);
    initialize(targetInstance: any, snapshot: any): void;
    isValidIdentifier(identifier: any): boolean;
}
