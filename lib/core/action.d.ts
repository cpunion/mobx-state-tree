export declare type ISerializedActionCall = {
    name: string;
    path?: string;
    args?: any[];
};
export declare type IRawActionCall = {
    name: string;
    object: any & IComplexValue;
    args: any[];
};
export declare type IMiddleWareHandler = (actionCall: IRawActionCall, next: (actionCall: IRawActionCall) => any) => any;
export declare function createActionInvoker(name: string, fn: Function): any;
/**
 * Dispatches an Action on a model instance. All middlewares will be triggered.
 * Returns the value of the last actoin
 *
 * @export
 * @param {Object} target
 * @param {IActionCall} action
 * @param {IActionCallOptions} [options]
 * @returns
 */
export declare function applyAction(target: IComplexValue, action: ISerializedActionCall): any;
export declare function onAction(target: IComplexValue, listener: (call: ISerializedActionCall) => void): IDisposer;
import { IComplexValue } from "./node";
import { IDisposer } from "../utils";
