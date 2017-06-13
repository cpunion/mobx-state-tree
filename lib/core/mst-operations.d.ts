import { IRawActionCall, ISerializedActionCall } from "./action";
import { IObservableArray, ObservableMap } from "mobx";
import { IComplexValue } from "./node";
import { IJsonPatch } from "./json-patch";
import { IDisposer } from "../utils";
import { ISnapshottable, IType } from "../types/type";
export declare function getType<S, T>(object: IComplexValue): IType<S, T>;
export declare function getChildType(object: IComplexValue, child: string): IType<any, any>;
/**
 * TODO: update docs
 * Registers middleware on a model instance that is invoked whenever one of it's actions is called, or an action on one of it's children.
 * Will only be invoked on 'root' actions, not on actions called from existing actions.
 *
 * The callback receives two parameter: the `action` parameter describes the action being invoked. The `next()` function can be used
 * to kick off the next middleware in the chain. Not invoking `next()` prevents the action from actually being executed!
 *
 * Action calls have the following signature:
 *
 * ```
 * export type IActionCall = {
 *    name: string;
 *    path?: string;
 *    args?: any[];
 * }
 * ```
 *
 * Example of a logging middleware:
 * ```
 * function logger(action, next) {
 *   console.dir(action)
 *   return next(action)
 * }
 *
 * onAction(myStore, logger)
 *
 * myStore.user.setAge(17)
 *
 * // emits:
 * {
 *    name: "setAge"
 *    path: "/user",
 *    args: [17]
 * }
 * ```
 *
 * @export
 * @param {Object} target model to intercept actions on
 * @param {(action: IActionCall, next: () => void) => void} callback the middleware that should be invoked whenever an action is triggered.
 * @returns {IDisposer} function to remove the middleware
 */
export declare function addMiddleware(target: IComplexValue, middleware: (action: IRawActionCall, next: (call: IRawActionCall) => any) => any): IDisposer;
/**
 * Registers a function that will be invoked for each that as made to the provided model instance, or any of it's children.
 * See 'patches' for more details. onPatch events are emitted immediately and will not await the end of a transaction.
 * Patches can be used to deep observe a model tree.
 *
 * @export
 * @param {Object} target the model instance from which to receive patches
 * @param {(patch: IJsonPatch) => void} callback the callback that is invoked for each patch
 * @returns {IDisposer} function to remove the listener
 */
export declare function onPatch(target: IComplexValue, callback: (patch: IJsonPatch) => void): IDisposer;
/**
 * Registeres a function that is invoked whenever a new snapshot for the given model instance is available.
 * The listener will only be fire at the and a MobX (trans)action
 *
 * @export
 * @param {Object} target
 * @param {(snapshot: any) => void} callback
 * @returns {IDisposer}
 */
export declare function onSnapshot<S>(target: ObservableMap<S>, callback: (snapshot: {
    [key: string]: S;
}) => void): IDisposer;
export declare function onSnapshot<S>(target: IObservableArray<S>, callback: (snapshot: S[]) => void): IDisposer;
export declare function onSnapshot<S>(target: ISnapshottable<S>, callback: (snapshot: S) => void): IDisposer;
/**
 * Applies a JSON-patch to the given model instance or bails out if the patch couldn't be applied
 *
 * @export
 * @param {Object} target
 * @param {IJsonPatch} patch
 * @returns
 */
export declare function applyPatch(target: IComplexValue, patch: IJsonPatch): void;
/**
 * Applies a number of JSON patches in a single MobX transaction
 * TODO: merge with applyPatch
 * @export
 * @param {Object} target
 * @param {IJsonPatch[]} patches
 */
export declare function applyPatches(target: IComplexValue, patches: IJsonPatch[]): void;
export interface IPatchRecorder {
    patches: IJsonPatch[];
    stop(): any;
    replay(target: IComplexValue): any;
}
export declare function recordPatches(subject: IComplexValue): IPatchRecorder;
/**
 * Applies a series of actions in a single MobX transaction.
 * TODO: just merge with applyAction
 *
 * Does not return any value
 *
 * @export
 * @param {Object} target
 * @param {IActionCall[]} actions
 * @param {IActionCallOptions} [options]
 */
export declare function applyActions(target: IComplexValue, actions: ISerializedActionCall[]): void;
export interface IActionRecorder {
    actions: ISerializedActionCall[];
    stop(): any;
    replay(target: IComplexValue): any;
}
export declare function recordActions(subject: IComplexValue): IActionRecorder;
/**
 * By default it is allowed to both directly modify a model or through an action.
 * However, in some cases you want to guarantee that the state tree is only modified through actions.
 * So that replaying action will reflect everything that can possible have happened to your objects, or that every mutation passes through your action middleware etc.
 * To disable modifying data in the tree without action, simple call `protect(model)`. Protect protects the passed model an all it's children
 *
 * @example
 * const Todo = types.model({
 *     done: false,
 *     toggle() {
 *         this.done = !this.done
 *     }
 * })
 *
 * const todo = new Todo()
 * todo.done = true // OK
 * protect(todo)
 * todo.done = false // throws!
 * todo.toggle() // OK
 */
export declare function protect(target: IComplexValue): void;
export declare function unprotect(target: IComplexValue): void;
/**
 * Returns true if the object is in protected mode, @see protect
 */
export declare function isProtected(target: IComplexValue): boolean;
/**
 * Applies a snapshot to a given model instances. Patch and snapshot listeners will be invoked as usual.
 *
 * @export
 * @param {Object} target
 * @param {Object} snapshot
 * @returns
 */
export declare function applySnapshot<S, T>(target: IComplexValue, snapshot: S): void;
/**
 * Calculates a snapshot from the given model instance. The snapshot will always reflect the latest state but use
 * structural sharing where possible. Doesn't require MobX transactions to be completed.
 *
 * @export
 * @param {Object} target
 * @returns {*}
 */
export declare function getSnapshot<S>(target: ObservableMap<S>): {
    [key: string]: S;
};
export declare function getSnapshot<S>(target: IObservableArray<S>): S[];
export declare function getSnapshot<S>(target: ISnapshottable<S>): S;
/**
 * Given a model instance, returns `true` if the object has a parent, that is, is part of another object, map or array
 *
 * @export
 * @param {Object} target
 * @param {number} depth = 1, how far should we look upward?
 * @returns {boolean}
 */
export declare function hasParent(target: IComplexValue, depth?: number): boolean;
/**
 * Returns the immediate parent of this object, or null.
 *
 * Note that the immediate parent can be either an object, map or array, and
 * doesn't necessarily refer to the parent model
 *
 * @export
 * @param {Object} target
 * @param {number} depth = 1, how far should we look upward?
 * @returns {*}
 */
export declare function getParent(target: IComplexValue, depth?: number): (any & IComplexValue);
export declare function getParent<T>(target: IComplexValue, depth?: number): (T & IComplexValue);
/**
 * Given an object in a model tree, returns the root object of that tree
 *
 * @export
 * @param {Object} target
 * @returns {*}
 */
export declare function getRoot(target: IComplexValue): any & IComplexValue;
export declare function getRoot<T>(target: IComplexValue): T & IComplexValue;
/**
 * Returns the path of the given object in the model tree
 *
 * @export
 * @param {Object} target
 * @returns {string}
 */
export declare function getPath(target: IComplexValue): string;
/**
 * Returns the path of the given object as unescaped string array
 *
 * @export
 * @param {Object} target
 * @returns {string[]}
 */
export declare function getPathParts(target: IComplexValue): string[];
/**
 * Returns true if the given object is the root of a model tree
 *
 * @export
 * @param {Object} target
 * @returns {boolean}
 */
export declare function isRoot(target: IComplexValue): boolean;
/**
 * Resolves a path relatively to a given object.
 *
 * @export
 * @param {Object} target
 * @param {string} path - escaped json path
 * @returns {*}
 */
export declare function resolvePath(target: IComplexValue, path: string): IComplexValue | any;
export declare function resolveIdentifier(type: IType<any, any>, target: IComplexValue, identifier: string | number): any;
/**
 *
 *
 * @export
 * @param {Object} target
 * @param {string} path
 * @returns {*}
 */
export declare function tryResolve(target: IComplexValue, path: string): IComplexValue | any;
export declare function getRelativePath(base: IComplexValue, target: IComplexValue): string;
/**
 *
 *
 * @export
 * @template T
 * @param {T} source
 * @returns {T}
 */
export declare function clone<T extends IComplexValue>(source: T, keepEnvironment?: boolean | any): T;
/**
 * Removes a model element from the state tree, and let it live on as a new state tree
 */
export declare function detach<T extends IComplexValue>(thing: T): T;
/**
 * Removes a model element from the state tree, and mark it as end-of-life; the element should not be used anymore
 */
export declare function destroy(thing: IComplexValue): void;
export declare function isAlive(thing: IComplexValue): boolean;
export declare function addDisposer(thing: IComplexValue, disposer: () => void): void;
export declare function getEnv(thing: IComplexValue): any;
/**
 * Performs a depth first walk through a tree
 */
export declare function walk(thing: IComplexValue, processor: (item: IComplexValue) => void): void;
