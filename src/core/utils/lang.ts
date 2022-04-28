import { Observable, Subscribable } from "rxjs";

export module ModuleUtils {
  export function isPromise<T = any>(obj: any): obj is Promise<T> {
    return !!obj && typeof obj.then === "function";
  }

  export function isSubscribable(
    obj: any | Subscribable<any>
  ): obj is Subscribable<any> {
    return !!obj && typeof obj.subscribe === "function";
  }

  export const isObservable = isSubscribable as (
    obj: any | Observable<any>
  ) => obj is Observable<any>;
}
