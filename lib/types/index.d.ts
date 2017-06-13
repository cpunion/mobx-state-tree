import { IObservableArray } from "mobx";
import { IType, ISimpleType, IComplexType } from "./type";
import { IExtendedObservableMap } from "./complex-types/map";
import { IModelType } from "./complex-types/object";
export { IType };
export declare const types: {
    model: {
        <T>(properties: {
            [K in keyof T]: T[K] | IType<any, T[K]>;
        } & ThisType<T>): IModelType<T, {}>;
        <T>(name: string, properties: {
            [K in keyof T]: T[K] | IType<any, T[K]>;
        } & ThisType<T>): IModelType<T, {}>;
        <T, A>(properties: {
            [K in keyof T]: T[K] | IType<any, T[K]>;
        } & ThisType<T>, operations: A & ThisType<T & A>): IModelType<T, A>;
        <T, A>(name: string, properties: {
            [K in keyof T]: T[K] | IType<any, T[K]>;
        } & ThisType<T>, operations: A & ThisType<T & A>): IModelType<T, A>;
    };
    extend: {
        <A, B, AA, BA>(name: string, a: IModelType<A, AA>, b: IModelType<B, BA>): IModelType<A & B, AA & BA>;
        <A, B, C, AA, BA, CA>(name: string, a: IModelType<A, AA>, b: IModelType<B, BA>, c: IModelType<C, CA>): IModelType<A & B & C, AA & BA & CA>;
        <A, B, AA, BA>(a: IModelType<A, AA>, b: IModelType<B, BA>): IModelType<A & B, AA & BA>;
        <A, B, C, AA, BA, CA>(a: IModelType<A, AA>, b: IModelType<B, BA>, c: IModelType<C, CA>): IModelType<A & B & C, AA & BA & CA>;
    };
    reference: <T>(factory: IType<any, T>) => IType<string | number, T>;
    union: {
        <SA, SB, TA, TB>(dispatch: (snapshot: any) => IType<any, any>, A: IType<SA, TA>, B: IType<SB, TB>): IType<SA | SB, TA | TB>;
        <SA, SB, TA, TB>(A: IType<SA, TA>, B: IType<SB, TB>): IType<SA | SB, TA | TB>;
        <SA, SB, SC, TA, TB, TC>(dispatch: (snapshot: any) => IType<any, any>, A: IType<SA, TA>, B: IType<SB, TB>, C: IType<SC, TC>): IType<SA | SB | SC, TA | TB | TC>;
        <SA, SB, SC, TA, TB, TC>(A: IType<SA, TA>, B: IType<SB, TB>, C: IType<SC, TC>): IType<SA | SB | SC, TA | TB | TC>;
        <SA, SB, SC, SD, TA, TB, TC, TD>(dispatch: (snapshot: any) => IType<any, any>, A: IType<SA, TA>, B: IType<SB, TB>, C: IType<SC, TC>, D: IType<SD, TD>): IType<SA | SB | SC | SD, TA | TB | TC | TD>;
        <SA, SB, SC, SD, TA, TB, TC, TD>(A: IType<SA, TA>, B: IType<SB, TB>, C: IType<SC, TC>, D: IType<SD, TD>): IType<SA | SB | SC | SD, TA | TB | TC | TD>;
        <SA, SB, SC, SD, SE, TA, TB, TC, TD, TE>(dispatch: (snapshot: any) => IType<any, any>, A: IType<SA, TA>, B: IType<SB, TB>, C: IType<SC, TC>, D: IType<SD, TD>, E: IType<SE, TE>): IType<SA | SB | SC | SD | SE, TA | TB | TC | TD | TE>;
        <SA, SB, SC, SD, SE, TA, TB, TC, TD, TE>(A: IType<SA, TA>, B: IType<SB, TB>, C: IType<SC, TC>, D: IType<SD, TD>, E: IType<SE, TE>): IType<SA | SB | SC | SD | SE, TA | TB | TC | TD | TE>;
        <SA, SB, SC, SD, SE, SF, TA, TB, TC, TD, TE, TF>(dispatch: (snapshot: any) => IType<any, any>, A: IType<SA, TA>, B: IType<SB, TB>, C: IType<SC, TC>, D: IType<SD, TD>, E: IType<SE, TE>, F: IType<SF, TF>): IType<SA | SB | SC | SD | SE | SF, TA | TB | TC | TD | TE | TF>;
        <SA, SB, SC, SD, SE, SF, TA, TB, TC, TD, TE, TF>(A: IType<SA, TA>, B: IType<SB, TB>, C: IType<SC, TC>, D: IType<SD, TD>, E: IType<SE, TE>, F: IType<SF, TF>): IType<SA | SB | SC | SD | SE | SF, TA | TB | TC | TD | TE | TF>;
        <SA, SB, SC, SD, SE, SF, SG, TA, TB, TC, TD, TE, TF, TG>(dispatch: (snapshot: any) => IType<any, any>, A: IType<SA, TA>, B: IType<SB, TB>, C: IType<SC, TC>, D: IType<SD, TD>, E: IType<SE, TE>, F: IType<SF, TF>, G: IType<SG, TG>): IType<SA | SB | SC | SD | SE | SF | SG, TA | TB | TC | TD | TE | TF | TG>;
        <SA, SB, SC, SD, SE, SF, SG, TA, TB, TC, TD, TE, TF, TG>(A: IType<SA, TA>, B: IType<SB, TB>, C: IType<SC, TC>, D: IType<SD, TD>, E: IType<SE, TE>, F: IType<SF, TF>, G: IType<SG, TG>): IType<SA | SB | SC | SD | SE | SF | SG, TA | TB | TC | TD | TE | TF | TG>;
        <SA, SB, SC, SD, SE, SF, SG, SH, TA, TB, TC, TD, TE, TF, TG, TH>(dispatch: (snapshot: any) => IType<any, any>, A: IType<SA, TA>, B: IType<SB, TB>, C: IType<SC, TC>, D: IType<SD, TD>, E: IType<SE, TE>, F: IType<SF, TF>, G: IType<SG, TG>, H: IType<SH, TH>): IType<SA | SB | SC | SD | SE | SF | SG | SH, TA | TB | TC | TD | TE | TF | TG | TH>;
        <SA, SB, SC, SD, SE, SF, SG, SH, TA, TB, TC, TD, TE, TF, TG, TH>(A: IType<SA, TA>, B: IType<SB, TB>, C: IType<SC, TC>, D: IType<SD, TD>, E: IType<SE, TE>, F: IType<SF, TF>, G: IType<SG, TG>, H: IType<SH, TH>): IType<SA | SB | SC | SD | SE | SF | SG | SH, TA | TB | TC | TD | TE | TF | TG | TH>;
        <SA, SB, SC, SD, SE, SF, SG, SH, SI, TA, TB, TC, TD, TE, TF, TG, TH, TI>(dispatch: (snapshot: any) => IType<any, any>, A: IType<SA, TA>, B: IType<SB, TB>, C: IType<SC, TC>, D: IType<SD, TD>, E: IType<SE, TE>, F: IType<SF, TF>, G: IType<SG, TG>, H: IType<SH, TH>, I: IType<SI, TI>): IType<SA | SB | SC | SD | SE | SF | SG | SH | SI, TA | TB | TC | TD | TE | TF | TG | TH | TI>;
        <SA, SB, SC, SD, SE, SF, SG, SH, SI, TA, TB, TC, TD, TE, TF, TG, TH, TI>(A: IType<SA, TA>, B: IType<SB, TB>, C: IType<SC, TC>, D: IType<SD, TD>, E: IType<SE, TE>, F: IType<SF, TF>, G: IType<SG, TG>, H: IType<SH, TH>, I: IType<SI, TI>): IType<SA | SB | SC | SD | SE | SF | SG | SH | SI, TA | TB | TC | TD | TE | TF | TG | TH | TI>;
        <SA, SB, SC, SD, SE, SF, SG, SH, SI, SJ, TA, TB, TC, TD, TE, TF, TG, TH, TI, TJ>(dispatch: (snapshot: any) => IType<any, any>, A: IType<SA, TA>, B: IType<SB, TB>, C: IType<SC, TC>, D: IType<SD, TD>, E: IType<SE, TE>, F: IType<SF, TF>, G: IType<SG, TG>, H: IType<SH, TH>, I: IType<SI, TI>, J: IType<SJ, TJ>): IType<SA | SB | SC | SD | SE | SF | SG | SH | SI | SJ, TA | TB | TC | TD | TE | TF | TG | TH | TI | TJ>;
        <SA, SB, SC, SD, SE, SF, SG, SH, SI, SJ, TA, TB, TC, TD, TE, TF, TG, TH, TI, TJ>(A: IType<SA, TA>, B: IType<SB, TB>, C: IType<SC, TC>, D: IType<SD, TD>, E: IType<SE, TE>, F: IType<SF, TF>, G: IType<SG, TG>, H: IType<SH, TH>, I: IType<SI, TI>, J: IType<SJ, TJ>): IType<SA | SB | SC | SD | SE | SF | SG | SH | SI | SJ, TA | TB | TC | TD | TE | TF | TG | TH | TI | TJ>;
        (...types: IType<any, any>[]): IType<any, any>;
        (dispatchOrType: IType<any, any> | ((snapshot: any) => IType<any, any>), ...otherTypes: IType<any, any>[]): IType<any, any>;
    };
    optional: {
        <S, T>(type: IType<S, T>, defaultValueOrFunction: S): IType<S, T>;
        <S, T>(type: IType<S, T>, defaultValueOrFunction: T): IType<S, T>;
        <S, T>(type: IType<S, T>, defaultValueOrFunction: () => S): IType<S, T>;
        <S, T>(type: IType<S, T>, defaultValueOrFunction: () => T): IType<S, T>;
    };
    literal: <S>(value: S) => ISimpleType<S>;
    maybe: <S, T>(type: IType<S, T>) => IType<S | null | undefined, T | null>;
    refinement: {
        <T>(name: string, type: IType<T, T>, predicate: (snapshot: T) => boolean): IType<T, T>;
        <S, T extends S, U extends S>(name: string, type: IType<S, T>, predicate: (snapshot: S) => snapshot is U): IType<S, U>;
    };
    string: ISimpleType<string>;
    boolean: ISimpleType<boolean>;
    number: ISimpleType<number>;
    Date: ISimpleType<Date>;
    map: <S, T>(subtype: IType<S, T>) => IComplexType<{
        [key: string]: S;
    }, IExtendedObservableMap<T>>;
    array: <S, T>(subtype: IType<S, T>) => IComplexType<S[], IObservableArray<T>>;
    frozen: ISimpleType<any>;
    identifier: {
        <T>(baseType: IType<T, T>): T;
        <T>(): T;
    };
    late: {
        <S, T>(type: () => IType<S, T>): IType<S, T>;
        <S, T>(name: string, type: () => IType<S, T>): IType<S, T>;
    };
};
