import { IRawActionCall } from "../core";
export interface IMiddleWareApi {
    getState: () => any;
    dispatch: (action: any) => void;
}
export interface IReduxStore extends IMiddleWareApi {
    subscribe(listener: (snapshot: any) => void): any;
}
export declare type MiddleWare = (middlewareApi: IMiddleWareApi) => ((next: (action: IRawActionCall) => void) => void);
export declare function asReduxStore(model: any, ...middlewares: MiddleWare[]): IReduxStore;
export declare function connectReduxDevtools(remoteDevDep: any, model: any): void;
