import { IType } from "../type";
export declare function maybe<S, T>(type: IType<S, T>): IType<S | null | undefined, T | null>;
