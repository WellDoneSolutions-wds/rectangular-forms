/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { Observable } from "rxjs";
import { AsyncProcessor } from "../addons/utils/LoadControl";
import { RuntimeError } from "../core/errors";
import { EventEmitter } from "../core/event_emmiter";

import {
  missingControlError,
  missingControlValueError,
  noControlsError,
} from "../directives/reactive_errors";
import {
  AsyncValidatorFn,
  ValidationErrors,
  ValidatorFn,
} from "../directives/validators";
import { RuntimeErrorCode } from "../errors";
import {
  addValidators,
  composeAsyncValidators,
  composeValidators,
  hasValidator,
  removeValidators,
  toObservable,
} from "../validators";
import { FormArray } from "./form_array";
import { FormGroup } from "./form_group";

/**
 * Reports that a control is valid, meaning that no errors exist in the input value.
 *
 * @see `status`
 */
export const VALID = "VALID";

/**
 * Reports that a control is invalid, meaning that an error exists in the input value.
 *
 * @see `status`
 */
export const INVALID = "INVALID";

/**
 * Reports that a control is pending, meaning that that async validation is occurring and
 * errors are not yet available for the input value.
 *
 * @see `markAsPending`
 * @see `status`
 */
export const PENDING = "PENDING";

/**
 * Reports that a control is disabled, meaning that the control is exempt from ancestor
 * calculations of validity or value.
 *
 * @see `markAsDisabled`
 * @see `status`
 */
export const DISABLED = "DISABLED";

/**
 * A form can have several different statuses. Each
 * possible status is returned as a string literal.
 *
 * * **VALID**: Reports that a control is valid, meaning that no errors exist in the input
 * value.
 * * **INVALID**: Reports that a control is invalid, meaning that an error exists in the input
 * value.
 * * **PENDING**: Reports that a control is pending, meaning that that async validation is
 * occurring and errors are not yet available for the input value.
 * * **DISABLED**: Reports that a control is
 * disabled, meaning that the control is exempt from ancestor calculations of validity or value.
 *
 * @publicApi
 */
export type FormControlStatus = "VALID" | "INVALID" | "PENDING" | "DISABLED";

/**
 * Gets validators from either an options object or given validators.
 */
export function pickValidators(
  validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null
): ValidatorFn | ValidatorFn[] | null {
  return (
    (isOptionsObj(validatorOrOpts)
      ? validatorOrOpts.validators
      : validatorOrOpts) || null
  );
}

/**
 * Creates validator function by combining provided validators.
 */
function coerceToValidator(
  validator: ValidatorFn | ValidatorFn[] | null
): ValidatorFn | null {
  return Array.isArray(validator)
    ? composeValidators(validator)
    : validator || null;
}

/**
 * Gets async validators from either an options object or given validators.
 */
export function pickAsyncValidators(
  asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null,
  validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null
): AsyncValidatorFn | AsyncValidatorFn[] | null {
  return (
    (isOptionsObj(validatorOrOpts)
      ? validatorOrOpts.asyncValidators
      : asyncValidator) || null
  );
}

/**
 * Creates async validator function by combining provided async validators.
 */
function coerceToAsyncValidator(
  asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null
): AsyncValidatorFn | null {
  return Array.isArray(asyncValidator)
    ? composeAsyncValidators(asyncValidator)
    : asyncValidator || null;
}

export type FormHooks = "change" | "blur" | "submit";

/**
 * Interface for options provided to an `AbstractControl`.
 *
 * @publicApi
 */
export interface AbstractControlOptions {
  /**
   * @description
   * The list of validators applied to a control.
   */
  validators?: ValidatorFn | ValidatorFn[] | null;
  /**
   * @description
   * The list of async validators applied to control.
   */
  asyncValidators?: AsyncValidatorFn | AsyncValidatorFn[] | null;
  /**
   * @description
   * The event name for control to update upon.
   */
  updateOn?: "change" | "blur" | "submit";
}

export function isOptionsObj(
  validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null
): validatorOrOpts is AbstractControlOptions {
  return (
    validatorOrOpts != null &&
    !Array.isArray(validatorOrOpts) &&
    typeof validatorOrOpts === "object"
  );
}

export function assertControlPresent(
  parent: any,
  isGroup: boolean,
  key: string | number
): void {
  const controls = parent.controls as { [key: string | number]: unknown };
  const collection = isGroup ? Object.keys(controls) : controls;
  if (!collection.length) {
    throw new RuntimeError(
      RuntimeErrorCode.NO_CONTROLS,
      noControlsError(isGroup)
    );
  }
  if (!controls[key]) {
    throw new RuntimeError(
      RuntimeErrorCode.MISSING_CONTROL,
      missingControlError(isGroup, key)
    );
  }
}

export function assertAllValuesPresent(
  control: any,
  isGroup: boolean,
  value: any
): void {
  control._forEachChild((_: unknown, key: string | number) => {
    if (value[key] === undefined) {
      throw new RuntimeError(
        RuntimeErrorCode.MISSING_CONTROL_VALUE,
        missingControlValueError(isGroup, key)
      );
    }
  });
}

// IsAny checks if T is `any`, by checking a condition that couldn't possibly be true otherwise.
export type ɵIsAny<T, Y, N> = 0 extends 1 & T ? Y : N;

/**
 * `TypedOrUntyped` allows one of two different types to be selected, depending on whether the Forms
 * class it's applied to is typed or not.
 *
 * This is for internal Angular usage to support typed forms; do not directly use it.
 */
export type ɵTypedOrUntyped<T, Typed, Untyped> = ɵIsAny<T, Untyped, Typed>;

/**
 * Value gives the type of `.value` in an `AbstractControl`.
 *
 * For internal use only.
 */
export type ɵValue<T extends AbstractControl | undefined> =
  T extends AbstractControl<any, any> ? T["value"] : never;

/**
 * RawValue gives the type of `.getRawValue()` in an `AbstractControl`.
 *
 * For internal use only.
 */
export type ɵRawValue<T extends AbstractControl | undefined> =
  T extends AbstractControl<any, any>
    ? T["setValue"] extends (v: infer R) => void
      ? R
      : never
    : never;

// Disable clang-format to produce clearer formatting for these multiline types.
// clang-format off

/**
 * Tokenize splits a string literal S by a delimeter D.
 */
export type ɵTokenize<S extends string, D extends string> = string extends S
  ? string[] /* S must be a literal */
  : S extends `${infer T}${D}${infer U}`
  ? [T, ...ɵTokenize<U, D>]
  : [S] /* Base case */;

/**
 * CoerceStrArrToNumArr accepts an array of strings, and converts any numeric string to a number.
 */
export type ɵCoerceStrArrToNumArr<S> =
  // Extract the head of the array.
  S extends [infer Head, ...infer Tail]
    ? // Using a template literal type, coerce the head to `number` if possible.
      // Then, recurse on the tail.
      Head extends `${number}`
      ? [number, ...ɵCoerceStrArrToNumArr<Tail>]
      : [Head, ...ɵCoerceStrArrToNumArr<Tail>]
    : [];

/**
 * Navigate takes a type T and an array K, and returns the type of T[K[0]][K[1]][K[2]]...
 */
export type ɵNavigate<
  T,
  K extends Array<string | number>
> = T extends object /* T must be indexable (object or array) */
  ? K extends [infer Head, ...infer Tail] /* Split K into head and tail */
    ? Head extends keyof T /* head(K) must index T */
      ? Tail extends (string | number)[] /* tail(K) must be an array */
        ? [] extends Tail
          ? T[Head] /* base case: K can be split, but Tail is empty */
          : ɵNavigate<T[Head], Tail> /* explore T[head(K)] by tail(K) */
        : any /* tail(K) was not an array, give up */
      : never /* head(K) does not index T, give up */
    : any /* K cannot be split, give up */
  : any /* T is not indexable, give up */;

/**
 * ɵWriteable removes readonly from all keys.
 */
export type ɵWriteable<T> = {
  -readonly [P in keyof T]: T[P];
};

/**
 * GetProperty takes a type T and some property names or indices K.
 * If K is a dot-separated string, it is tokenized into an array before proceeding.
 * Then, the type of the nested property at K is computed: T[K[0]][K[1]][K[2]]...
 * This works with both objects, which are indexed by property name, and arrays, which are indexed
 * numerically.
 *
 * For internal use only.
 */
export type ɵGetProperty<T, K> =
  // K is a string
  K extends string
    ? ɵGetProperty<T, ɵCoerceStrArrToNumArr<ɵTokenize<K, ".">>>
    : // Is is an array
    ɵWriteable<K> extends Array<string | number>
    ? ɵNavigate<T, ɵWriteable<K>>
    : // Fall through permissively if we can't calculate the type of K.
      any;

// clang-format on

/**
 * This is the base class for `FormControl`, `FormGroup`, and `FormArray`.
 *
 * It provides some of the shared behavior that all controls and groups of controls have, like
 * running validators, calculating status, and resetting state. It also defines the properties
 * that are shared between all sub-classes, like `value`, `valid`, and `dirty`. It shouldn't be
 * instantiated directly.
 *
 * The first type parameter TValue represents the value type of the control (`control.value`).
 * The optional type parameter TRawValue  represents the raw value type (`control.getRawValue()`).
 *
 * @see [Forms Guide](/guide/forms)
 * @see [Reactive Forms Guide](/guide/reactive-forms)
 * @see [Dynamic Forms Guide](/guide/dynamic-form)
 *
 * @publicApi
 */
export abstract class AbstractControl<
  TValue = any,
  TRawValue extends TValue = TValue
> {
  /** @internal */
  _pendingDirty = false;

  /**
   * Indicates that a control has its own pending asynchronous validation in progress.
   *
   * @internal
   */
  _hasOwnPendingAsyncValidator = false;

  /** @internal */
  _pendingTouched = false;

  /** @internal */
  _onCollectionChange = () => {};

  /** @internal */
  _updateOn?: FormHooks;

  private _parent: FormGroup | FormArray | null = null;
  private _asyncValidationSubscription: any;

  /**
   * Contains the result of merging synchronous validators into a single validator function
   * (combined using `Validators.compose`).
   *
   * @internal
   */
  private _composedValidatorFn: ValidatorFn | null;

  /**
   * Contains the result of merging asynchronous validators into a single validator function
   * (combined using `Validators.composeAsync`).
   *
   * @internal
   */
  private _composedAsyncValidatorFn: AsyncValidatorFn | null;

  /**
   * Synchronous validators as they were provided:
   *  - in `AbstractControl` constructor
   *  - as an argument while calling `setValidators` function
   *  - while calling the setter on the `validator` field (e.g. `control.validator = validatorFn`)
   *
   * @internal
   */
  private _rawValidators: ValidatorFn | ValidatorFn[] | null;

  /**
   * Asynchronous validators as they were provided:
   *  - in `AbstractControl` constructor
   *  - as an argument while calling `setAsyncValidators` function
   *  - while calling the setter on the `asyncValidator` field (e.g. `control.asyncValidator =
   * asyncValidatorFn`)
   *
   * @internal
   */
  private _rawAsyncValidators: AsyncValidatorFn | AsyncValidatorFn[] | null;

  /**
   * The current value of the control.
   *
   * * For a `FormControl`, the current value.
   * * For an enabled `FormGroup`, the values of enabled controls as an object
   * with a key-value pair for each member of the group.
   * * For a disabled `FormGroup`, the values of all controls as an object
   * with a key-value pair for each member of the group.
   * * For a `FormArray`, the values of enabled controls as an array.
   *
   */
  public readonly value!: TValue;

  /**
   * Initialize the AbstractControl instance.
   *
   * @param validators The function or array of functions that is used to determine the validity of
   *     this control synchronously.
   * @param asyncValidators The function or array of functions that is used to determine validity of
   *     this control asynchronously.
   */
  constructor(
    validators: ValidatorFn | ValidatorFn[] | null,
    asyncValidators: AsyncValidatorFn | AsyncValidatorFn[] | null
  ) {
    this._rawValidators = validators;
    this._rawAsyncValidators = asyncValidators;
    this._composedValidatorFn = coerceToValidator(this._rawValidators);
    this._composedAsyncValidatorFn = coerceToAsyncValidator(
      this._rawAsyncValidators
    );
    // this.forceUpdate = this.forceUpdate.bind(this);
  }

  /**
   * Returns the function that is used to determine the validity of this control synchronously.
   * If multiple validators have been added, this will be a single composed function.
   * See `Validators.compose()` for additional information.
   */
  get validator(): ValidatorFn | null {
    return this._composedValidatorFn;
  }
  set validator(validatorFn: ValidatorFn | null) {
    this._rawValidators = this._composedValidatorFn = validatorFn;
  }

  /**
   * Returns the function that is used to determine the validity of this control asynchronously.
   * If multiple validators have been added, this will be a single composed function.
   * See `Validators.compose()` for additional information.
   */
  get asyncValidator(): AsyncValidatorFn | null {
    return this._composedAsyncValidatorFn;
  }
  set asyncValidator(asyncValidatorFn: AsyncValidatorFn | null) {
    this._rawAsyncValidators = this._composedAsyncValidatorFn =
      asyncValidatorFn;
  }

  /**
   * The parent control.
   */
  get parent(): FormGroup | FormArray | null {
    return this._parent;
  }

  /**
   * The validation status of the control.
   *
   * @see `FormControlStatus`
   *
   * These status values are mutually exclusive, so a control cannot be
   * both valid AND invalid or invalid AND disabled.
   */
  public readonly status!: FormControlStatus;

  /**
   * A control is `valid` when its `status` is `VALID`.
   *
   * @see {@link AbstractControl.status}
   *
   * @returns True if the control has passed all of its validation tests,
   * false otherwise.
   */
  get valid(): boolean {
    return this.status === VALID;
  }

  /**
   * A control is `invalid` when its `status` is `INVALID`.
   *
   * @see {@link AbstractControl.status}
   *
   * @returns True if this control has failed one or more of its validation checks,
   * false otherwise.
   */
  get invalid(): boolean {
    return this.status === INVALID;
  }

  /**
   * A control is `pending` when its `status` is `PENDING`.
   *
   * @see {@link AbstractControl.status}
   *
   * @returns True if this control is in the process of conducting a validation check,
   * false otherwise.
   */
  get pending(): boolean {
    return this.status === PENDING;
  }

  /**
   * A control is `disabled` when its `status` is `DISABLED`.
   *
   * Disabled controls are exempt from validation checks and
   * are not included in the aggregate value of their ancestor
   * controls.
   *
   * @see {@link AbstractControl.status}
   *
   * @returns True if the control is disabled, false otherwise.
   */
  get disabled(): boolean {
    return this.status === DISABLED;
  }

  /**
   * A control is `enabled` as long as its `status` is not `DISABLED`.
   *
   * @returns True if the control has any status other than 'DISABLED',
   * false if the status is 'DISABLED'.
   *
   * @see {@link AbstractControl.status}
   *
   */
  get enabled(): boolean {
    return this.status !== DISABLED;
  }

  /**
   * An object containing any errors generated by failing validation,
   * or null if there are no errors.
   */
  public readonly errors!: ValidationErrors | null;

  /**
   * A control is `pristine` if the user has not yet changed
   * the value in the UI.
   *
   * @returns True if the user has not yet changed the value in the UI; compare `dirty`.
   * Programmatic changes to a control's value do not mark it dirty.
   */
  public readonly pristine: boolean = true;

  /**
   * A control is `dirty` if the user has changed the value
   * in the UI.
   *
   * @returns True if the user has changed the value of this control in the UI; compare `pristine`.
   * Programmatic changes to a control's value do not mark it dirty.
   */
  get dirty(): boolean {
    return !this.pristine;
  }

  /**
   * True if the control is marked as `touched`.
   *
   * A control is marked `touched` once the user has triggered
   * a `blur` event on it.
   */
  public readonly touched: boolean = false;

  /**
   * True if the control has not been marked as touched
   *
   * A control is `untouched` if the user has not yet triggered
   * a `blur` event on it.
   */
  get untouched(): boolean {
    return !this.touched;
  }

  /**
   * A multicasting observable that emits an event every time the value of the control changes, in
   * the UI or programmatically. It also emits an event each time you call enable() or disable()
   * without passing along {emitEvent: false} as a function argument.
   */
  public readonly valueChanges!: Observable<TValue>;

  /**
   * A multicasting observable that emits an event every time the validation `status` of the control
   * recalculates.
   *
   * @see `FormControlStatus`
   * @see {@link AbstractControl.status}
   *
   */
  public readonly statusChanges!: Observable<FormControlStatus>;

  /**
   * Reports the update strategy of the `AbstractControl` (meaning
   * the event on which the control updates itself).
   * Possible values: `'change'` | `'blur'` | `'submit'`
   * Default value: `'change'`
   */
  get updateOn(): FormHooks {
    return this._updateOn
      ? this._updateOn
      : this.parent
      ? this.parent.updateOn
      : "change";
  }

  /**
   * Sets the synchronous validators that are active on this control.  Calling
   * this overwrites any existing synchronous validators.
   *
   * When you add or remove a validator at run time, you must call
   * `updateValueAndValidity()` for the new validation to take effect.
   *
   * If you want to add a new validator without affecting existing ones, consider
   * using `addValidators()` method instead.
   */
  setValidators(validators: ValidatorFn | ValidatorFn[] | null): void {
    this._rawValidators = validators;
    this._composedValidatorFn = coerceToValidator(validators);
  }

  /**
   * Sets the asynchronous validators that are active on this control. Calling this
   * overwrites any existing asynchronous validators.
   *
   * When you add or remove a validator at run time, you must call
   * `updateValueAndValidity()` for the new validation to take effect.
   *
   * If you want to add a new validator without affecting existing ones, consider
   * using `addAsyncValidators()` method instead.
   */
  setAsyncValidators(
    validators: AsyncValidatorFn | AsyncValidatorFn[] | null
  ): void {
    this._rawAsyncValidators = validators;
    this._composedAsyncValidatorFn = coerceToAsyncValidator(validators);
  }

  /**
   * Add a synchronous validator or validators to this control, without affecting other validators.
   *
   * When you add or remove a validator at run time, you must call
   * `updateValueAndValidity()` for the new validation to take effect.
   *
   * Adding a validator that already exists will have no effect. If duplicate validator functions
   * are present in the `validators` array, only the first instance would be added to a form
   * control.
   *
   * @param validators The new validator function or functions to add to this control.
   */
  addValidators(validators: ValidatorFn | ValidatorFn[]): void {
    this.setValidators(addValidators(validators, this._rawValidators));
  }

  /**
   * Add an asynchronous validator or validators to this control, without affecting other
   * validators.
   *
   * When you add or remove a validator at run time, you must call
   * `updateValueAndValidity()` for the new validation to take effect.
   *
   * Adding a validator that already exists will have no effect.
   *
   * @param validators The new asynchronous validator function or functions to add to this control.
   */
  addAsyncValidators(validators: AsyncValidatorFn | AsyncValidatorFn[]): void {
    this.setAsyncValidators(
      addValidators(validators, this._rawAsyncValidators)
    );
  }

  /**
   * Remove a synchronous validator from this control, without affecting other validators.
   * Validators are compared by function reference; you must pass a reference to the exact same
   * validator function as the one that was originally set. If a provided validator is not found,
   * it is ignored.
   *
   * When you add or remove a validator at run time, you must call
   * `updateValueAndValidity()` for the new validation to take effect.
   *
   * @param validators The validator or validators to remove.
   */
  removeValidators(validators: ValidatorFn | ValidatorFn[]): void {
    this.setValidators(removeValidators(validators, this._rawValidators));
  }

  /**
   * Remove an asynchronous validator from this control, without affecting other validators.
   * Validators are compared by function reference; you must pass a reference to the exact same
   * validator function as the one that was originally set. If a provided validator is not found, it
   * is ignored.
   *
   * When you add or remove a validator at run time, you must call
   * `updateValueAndValidity()` for the new validation to take effect.
   *
   * @param validators The asynchronous validator or validators to remove.
   */
  removeAsyncValidators(
    validators: AsyncValidatorFn | AsyncValidatorFn[]
  ): void {
    this.setAsyncValidators(
      removeValidators(validators, this._rawAsyncValidators)
    );
  }

  /**
   * Check whether a synchronous validator function is present on this control. The provided
   * validator must be a reference to the exact same function that was provided.
   *
   * @param validator The validator to check for presence. Compared by function reference.
   * @returns Whether the provided validator was found on this control.
   */
  hasValidator(validator: ValidatorFn): boolean {
    return hasValidator(this._rawValidators, validator);
  }

  /**
   * Check whether an asynchronous validator function is present on this control. The provided
   * validator must be a reference to the exact same function that was provided.
   *
   * @param validator The asynchronous validator to check for presence. Compared by function
   *     reference.
   * @returns Whether the provided asynchronous validator was found on this control.
   */
  hasAsyncValidator(validator: AsyncValidatorFn): boolean {
    return hasValidator(this._rawAsyncValidators, validator);
  }

  /**
   * Empties out the synchronous validator list.
   *
   * When you add or remove a validator at run time, you must call
   * `updateValueAndValidity()` for the new validation to take effect.
   *
   */
  clearValidators(): void {
    this.validator = null;
  }

  /**
   * Empties out the async validator list.
   *
   * When you add or remove a validator at run time, you must call
   * `updateValueAndValidity()` for the new validation to take effect.
   *
   */
  clearAsyncValidators(): void {
    this.asyncValidator = null;
  }

  /**
   * Marks the control as `touched`. A control is touched by focus and
   * blur events that do not change the value.
   *
   * @see `markAsUntouched()`
   * @see `markAsDirty()`
   * @see `markAsPristine()`
   *
   * @param opts Configuration options that determine how the control propagates changes
   * and emits events after marking is applied.
   * * `onlySelf`: When true, mark only this control. When false or not supplied,
   * marks all direct ancestors. Default is false.
   */
  markAsTouched(opts: { onlySelf?: boolean } = {}): void {
    (this as { touched: boolean }).touched = true;

    if (this._parent && !opts.onlySelf) {
      this._parent.markAsTouched(opts);
    }
  }

  /**
   * Marks the control and all its descendant controls as `touched`.
   * @see `markAsTouched()`
   */
  markAllAsTouched(): void {
    this.markAsTouched({ onlySelf: true });

    this._forEachChild((control: AbstractControl) =>
      control.markAllAsTouched()
    );
  }

  /**
   * Marks the control as `untouched`.
   *
   * If the control has any children, also marks all children as `untouched`
   * and recalculates the `touched` status of all parent controls.
   *
   * @see `markAsTouched()`
   * @see `markAsDirty()`
   * @see `markAsPristine()`
   *
   * @param opts Configuration options that determine how the control propagates changes
   * and emits events after the marking is applied.
   * * `onlySelf`: When true, mark only this control. When false or not supplied,
   * marks all direct ancestors. Default is false.
   */
  markAsUntouched(opts: { onlySelf?: boolean } = {}): void {
    (this as { touched: boolean }).touched = false;
    this._pendingTouched = false;

    this._forEachChild((control: AbstractControl) => {
      control.markAsUntouched({ onlySelf: true });
    });

    if (this._parent && !opts.onlySelf) {
      this._parent._updateTouched(opts);
    }
  }

  /**
   * Marks the control as `dirty`. A control becomes dirty when
   * the control's value is changed through the UI; compare `markAsTouched`.
   *
   * @see `markAsTouched()`
   * @see `markAsUntouched()`
   * @see `markAsPristine()`
   *
   * @param opts Configuration options that determine how the control propagates changes
   * and emits events after marking is applied.
   * * `onlySelf`: When true, mark only this control. When false or not supplied,
   * marks all direct ancestors. Default is false.
   */
  markAsDirty(opts: { onlySelf?: boolean } = {}): void {
    (this as { pristine: boolean }).pristine = false;

    if (this._parent && !opts.onlySelf) {
      this._parent.markAsDirty(opts);
    }
  }

  /**
   * Marks the control as `pristine`.
   *
   * If the control has any children, marks all children as `pristine`,
   * and recalculates the `pristine` status of all parent
   * controls.
   *
   * @see `markAsTouched()`
   * @see `markAsUntouched()`
   * @see `markAsDirty()`
   *
   * @param opts Configuration options that determine how the control emits events after
   * marking is applied.
   * * `onlySelf`: When true, mark only this control. When false or not supplied,
   * marks all direct ancestors. Default is false.
   */
  markAsPristine(opts: { onlySelf?: boolean } = {}): void {
    (this as { pristine: boolean }).pristine = true;
    this._pendingDirty = false;

    this._forEachChild((control: AbstractControl) => {
      control.markAsPristine({ onlySelf: true });
    });

    if (this._parent && !opts.onlySelf) {
      this._parent._updatePristine(opts);
    }
  }

  /**
   * Marks the control as `pending`.
   *
   * A control is pending while the control performs async validation.
   *
   * @see {@link AbstractControl.status}
   *
   * @param opts Configuration options that determine how the control propagates changes and
   * emits events after marking is applied.
   * * `onlySelf`: When true, mark only this control. When false or not supplied,
   * marks all direct ancestors. Default is false.
   * * `emitEvent`: When true or not supplied (the default), the `statusChanges`
   * observable emits an event with the latest status the control is marked pending.
   * When false, no events are emitted.
   *
   */
  markAsPending(opts: { onlySelf?: boolean; emitEvent?: boolean } = {}): void {
    (this as { status: FormControlStatus }).status = PENDING;

    if (opts.emitEvent !== false) {
      (this.statusChanges as EventEmitter<FormControlStatus>).emit(this.status);
    }

    if (this._parent && !opts.onlySelf) {
      this._parent.markAsPending(opts);
    }
  }

  /**
   * Disables the control. This means the control is exempt from validation checks and
   * excluded from the aggregate value of any parent. Its status is `DISABLED`.
   *
   * If the control has children, all children are also disabled.
   *
   * @see {@link AbstractControl.status}
   *
   * @param opts Configuration options that determine how the control propagates
   * changes and emits events after the control is disabled.
   * * `onlySelf`: When true, mark only this control. When false or not supplied,
   * marks all direct ancestors. Default is false.
   * * `emitEvent`: When true or not supplied (the default), both the `statusChanges` and
   * `valueChanges`
   * observables emit events with the latest status and value when the control is disabled.
   * When false, no events are emitted.
   */
  disable(opts: { onlySelf?: boolean; emitEvent?: boolean } = {}): void {
    // If parent has been marked artificially dirty we don't want to re-calculate the
    // parent's dirtiness based on the children.
    const skipPristineCheck = this._parentMarkedDirty(opts.onlySelf);

    (this as { status: FormControlStatus }).status = DISABLED;
    (this as { errors: ValidationErrors | null }).errors = null;
    this._forEachChild((control: AbstractControl) => {
      control.disable({ ...opts, onlySelf: true });
    });
    this._updateValue();

    if (opts.emitEvent !== false) {
      (this.valueChanges as EventEmitter<TValue>).emit(this.value);
      (this.statusChanges as EventEmitter<FormControlStatus>).emit(this.status);
    }

    this._updateAncestors({ ...opts, skipPristineCheck });
    this._onDisabledChange.forEach((changeFn) => changeFn(true));
  }

  /**
   * Enables the control. This means the control is included in validation checks and
   * the aggregate value of its parent. Its status recalculates based on its value and
   * its validators.
   *
   * By default, if the control has children, all children are enabled.
   *
   * @see {@link AbstractControl.status}
   *
   * @param opts Configure options that control how the control propagates changes and
   * emits events when marked as untouched
   * * `onlySelf`: When true, mark only this control. When false or not supplied,
   * marks all direct ancestors. Default is false.
   * * `emitEvent`: When true or not supplied (the default), both the `statusChanges` and
   * `valueChanges`
   * observables emit events with the latest status and value when the control is enabled.
   * When false, no events are emitted.
   */
  enable(opts: { onlySelf?: boolean; emitEvent?: boolean } = {}): void {
    // If parent has been marked artificially dirty we don't want to re-calculate the
    // parent's dirtiness based on the children.
    const skipPristineCheck = this._parentMarkedDirty(opts.onlySelf);

    (this as { status: FormControlStatus }).status = VALID;
    this._forEachChild((control: AbstractControl) => {
      control.enable({ ...opts, onlySelf: true });
    });
    this.updateValueAndValidity({ onlySelf: true, emitEvent: opts.emitEvent });

    this._updateAncestors({ ...opts, skipPristineCheck });
    this._onDisabledChange.forEach((changeFn) => changeFn(false));
  }

  private _updateAncestors(opts: {
    onlySelf?: boolean;
    emitEvent?: boolean;
    skipPristineCheck?: boolean;
  }): void {
    if (this._parent && !opts.onlySelf) {
      this._parent.updateValueAndValidity(opts);
      if (!opts.skipPristineCheck) {
        this._parent._updatePristine();
      }
      this._parent._updateTouched();
    }
  }

  /**
   * Sets the parent of the control
   *
   * @param parent The new parent.
   */
  setParent(parent: FormGroup | FormArray | null): void {
    this._parent = parent;
  }

  /**
   * Sets the value of the control. Abstract method (implemented in sub-classes).
   */
  abstract setValue(value: TRawValue, options?: Object): void;

  /**
   * Patches the value of the control. Abstract method (implemented in sub-classes).
   */
  abstract patchValue(value: TValue, options?: Object): void;

  /**
   * Resets the control. Abstract method (implemented in sub-classes).
   */
  abstract reset(value?: TValue, options?: Object): void;

  /**
   * The raw value of this control. For most control implementations, the raw value will include
   * disabled children.
   */
  getRawValue(): any {
    return this.value;
  }

  /**
   * Recalculates the value and validation status of the control.
   *
   * By default, it also updates the value and validity of its ancestors.
   *
   * @param opts Configuration options determine how the control propagates changes and emits events
   * after updates and validity checks are applied.
   * * `onlySelf`: When true, only update this control. When false or not supplied,
   * update all direct ancestors. Default is false.
   * * `emitEvent`: When true or not supplied (the default), both the `statusChanges` and
   * `valueChanges`
   * observables emit events with the latest status and value when the control is updated.
   * When false, no events are emitted.
   */
  updateValueAndValidity(
    opts: { onlySelf?: boolean; emitEvent?: boolean } = {}
  ): void {
    this._setInitialStatus();
    this._updateValue();

    if (this.enabled) {
      this._cancelExistingSubscription();
      (this as { errors: ValidationErrors | null }).errors =
        this._runValidator();
      (this as { status: FormControlStatus }).status = this._calculateStatus();

      if (this.status === VALID || this.status === PENDING) {
        this._runAsyncValidator(opts.emitEvent);
      }
    }

    if (opts.emitEvent !== false) {
      (this.valueChanges as EventEmitter<TValue>).emit(this.value);
      (this.statusChanges as EventEmitter<FormControlStatus>).emit(this.status);
    }

    if (this._parent && !opts.onlySelf) {
      this._parent.updateValueAndValidity(opts);
    }
  }

  /** @internal */
  _updateTreeValidity(
    opts: { emitEvent?: boolean } = { emitEvent: true }
  ): void {
    this._forEachChild((ctrl: AbstractControl) =>
      ctrl._updateTreeValidity(opts)
    );
    this.updateValueAndValidity({ onlySelf: true, emitEvent: opts.emitEvent });
  }

  private _setInitialStatus() {
    (this as { status: FormControlStatus }).status = this._allControlsDisabled()
      ? DISABLED
      : VALID;
  }

  private _runValidator(): ValidationErrors | null {
    return this.validator ? this.validator(this) : null;
  }

  private _runAsyncValidator(emitEvent?: boolean): void {
    if (this.asyncValidator) {
      (this as { status: FormControlStatus }).status = PENDING;
      this._hasOwnPendingAsyncValidator = true;
      const obs = toObservable(this.asyncValidator(this));
      this._asyncValidationSubscription = obs.subscribe(
        (errors: ValidationErrors | null) => {
          this._hasOwnPendingAsyncValidator = false;
          // This will trigger the recalculation of the validation status, which depends on
          // the state of the asynchronous validation (whether it is in progress or not). So, it is
          // necessary that we have updated the `_hasOwnPendingAsyncValidator` boolean flag first.
          this.setErrors(errors, { emitEvent });
        }
      );
    }
  }

  private _cancelExistingSubscription(): void {
    if (this._asyncValidationSubscription) {
      this._asyncValidationSubscription.unsubscribe();
      this._hasOwnPendingAsyncValidator = false;
    }
  }

  /**
   * Sets errors on a form control when running validations manually, rather than automatically.
   *
   * Calling `setErrors` also updates the validity of the parent control.
   *
   * @usageNotes
   *
   * ### Manually set the errors for a control
   *
   * ```
   * const login = new FormControl('someLogin');
   * login.setErrors({
   *   notUnique: true
   * });
   *
   * expect(login.valid).toEqual(false);
   * expect(login.errors).toEqual({ notUnique: true });
   *
   * login.setValue('someOtherLogin');
   *
   * expect(login.valid).toEqual(true);
   * ```
   */
  setErrors(
    errors: ValidationErrors | null,
    opts: { emitEvent?: boolean } = {}
  ): void {
    (this as { errors: ValidationErrors | null }).errors = errors;
    this._updateControlsErrors(opts.emitEvent !== false);
  }

  /**
   * Retrieves a child control given the control's name or path.
   *
   * This signature for get supports strings and `const` arrays (`.get(['foo', 'bar'] as const)`).
   */
  get<P extends string | readonly (string | number)[]>(
    path: P
  ): AbstractControl<ɵGetProperty<TRawValue, P>> | null;

  /**
   * Retrieves a child control given the control's name or path.
   *
   * This signature for `get` supports non-const (mutable) arrays. Inferred type
   * information will not be as robust, so prefer to pass a `readonly` array if possible.
   */
  get<P extends string | Array<string | number>>(
    path: P
  ): AbstractControl<ɵGetProperty<TRawValue, P>> | null;

  /**
   * Retrieves a child control given the control's name or path.
   *
   * @param path A dot-delimited string or array of string/number values that define the path to the
   * control. If a string is provided, passing it as a string literal will result in improved type
   * information. Likewise, if an array is provided, passing it `as const` will cause improved type
   * information to be available.
   *
   * @usageNotes
   * ### Retrieve a nested control
   *
   * For example, to get a `name` control nested within a `person` sub-group:
   *
   * * `this.form.get('person.name');`
   *
   * -OR-
   *
   * * `this.form.get(['person', 'name'] as const);` // `as const` gives improved typings
   *
   * ### Retrieve a control in a FormArray
   *
   * When accessing an element inside a FormArray, you can use an element index.
   * For example, to get a `price` control from the first element in an `items` array you can use:
   *
   * * `this.form.get('items.0.price');`
   *
   * -OR-
   *
   * * `this.form.get(['items', 0, 'price']);`
   */
  get<P extends string | (string | number)[]>(
    path: P
  ): AbstractControl<ɵGetProperty<TRawValue, P>> | null {
    let currPath: Array<string | number> | string = path;
    if (currPath == null) return null;
    if (!Array.isArray(currPath)) currPath = currPath.split(".");
    if (currPath.length === 0) return null;
    return currPath.reduce(
      (control: AbstractControl | null, name) => control && control._find(name),
      this
    );
  }

  /**
   * @description
   * Reports error data for the control with the given path.
   *
   * @param errorCode The code of the error to check
   * @param path A list of control names that designates how to move from the current control
   * to the control that should be queried for errors.
   *
   * @usageNotes
   * For example, for the following `FormGroup`:
   *
   * ```
   * form = new FormGroup({
   *   address: new FormGroup({ street: new FormControl() })
   * });
   * ```
   *
   * The path to the 'street' control from the root form would be 'address' -> 'street'.
   *
   * It can be provided to this method in one of two formats:
   *
   * 1. An array of string control names, e.g. `['address', 'street']`
   * 1. A period-delimited list of control names in one string, e.g. `'address.street'`
   *
   * @returns error data for that particular error. If the control or error is not present,
   * null is returned.
   */
  getError(errorCode: string, path?: Array<string | number> | string): any {
    const control = path ? this.get(path) : this;
    return control && control.errors ? control.errors[errorCode] : null;
  }

  /**
   * @description
   * Reports whether the control with the given path has the error specified.
   *
   * @param errorCode The code of the error to check
   * @param path A list of control names that designates how to move from the current control
   * to the control that should be queried for errors.
   *
   * @usageNotes
   * For example, for the following `FormGroup`:
   *
   * ```
   * form = new FormGroup({
   *   address: new FormGroup({ street: new FormControl() })
   * });
   * ```
   *
   * The path to the 'street' control from the root form would be 'address' -> 'street'.
   *
   * It can be provided to this method in one of two formats:
   *
   * 1. An array of string control names, e.g. `['address', 'street']`
   * 1. A period-delimited list of control names in one string, e.g. `'address.street'`
   *
   * If no path is given, this method checks for the error on the current control.
   *
   * @returns whether the given error is present in the control at the given path.
   *
   * If the control is not present, false is returned.
   */
  hasError(errorCode: string, path?: Array<string | number> | string): boolean {
    return !!this.getError(errorCode, path);
  }

  /****** WDS:Modified ******/
  forceUpdate!: () => void;

  load = new AsyncProcessor(() => this.root.forceUpdate());

  onChange: (event: any) => void = () => {};
  onBlur: () => void = () => {};

  /**************************/

  /**
   * Retrieves the top-level ancestor of this control.
   */
  get root(): AbstractControl {
    let x: AbstractControl = this;

    while (x._parent) {
      x = x._parent;
    }

    return x;
  }

  /** @internal */
  _updateControlsErrors(emitEvent: boolean): void {
    (this as { status: FormControlStatus }).status = this._calculateStatus();

    if (emitEvent) {
      (this.statusChanges as EventEmitter<FormControlStatus>).emit(this.status);
    }

    if (this._parent) {
      this._parent._updateControlsErrors(emitEvent);
    }
  }

  /** @internal */
  _initObservables() {
    (this as { valueChanges: Observable<TValue> }).valueChanges =
      new EventEmitter();
    (this as { statusChanges: Observable<FormControlStatus> }).statusChanges =
      new EventEmitter();
  }

  private _calculateStatus(): FormControlStatus {
    if (this._allControlsDisabled()) return DISABLED;
    if (this.errors) return INVALID;
    if (
      this._hasOwnPendingAsyncValidator ||
      this._anyControlsHaveStatus(PENDING)
    )
      return PENDING;
    if (this._anyControlsHaveStatus(INVALID)) return INVALID;
    return VALID;
  }

  /** @internal */
  abstract _updateValue(): void;

  /** @internal */
  abstract _forEachChild(cb: (c: AbstractControl) => void): void;

  /** @internal */
  abstract _anyControls(condition: (c: AbstractControl) => boolean): boolean;

  /** @internal */
  abstract _allControlsDisabled(): boolean;

  /** @internal */
  abstract _syncPendingControls(): boolean;

  /** @internal */
  _anyControlsHaveStatus(status: FormControlStatus): boolean {
    return this._anyControls(
      (control: AbstractControl) => control.status === status
    );
  }

  /** @internal */
  _anyControlsDirty(): boolean {
    return this._anyControls((control: AbstractControl) => control.dirty);
  }

  /** @internal */
  _anyControlsTouched(): boolean {
    return this._anyControls((control: AbstractControl) => control.touched);
  }

  /** @internal */
  _updatePristine(opts: { onlySelf?: boolean } = {}): void {
    (this as { pristine: boolean }).pristine = !this._anyControlsDirty();

    if (this._parent && !opts.onlySelf) {
      this._parent._updatePristine(opts);
    }
  }

  /** @internal */
  _updateTouched(opts: { onlySelf?: boolean } = {}): void {
    (this as { touched: boolean }).touched = this._anyControlsTouched();

    if (this._parent && !opts.onlySelf) {
      this._parent._updateTouched(opts);
    }
  }

  /** @internal */
  _onDisabledChange: Array<(isDisabled: boolean) => void> = [];

  /** @internal */
  _registerOnCollectionChange(fn: () => void): void {
    this._onCollectionChange = fn;
  }

  /** @internal */
  _setUpdateStrategy(
    opts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null
  ): void {
    if (isOptionsObj(opts) && opts.updateOn != null) {
      this._updateOn = opts.updateOn!;
    }
  }
  /**
   * Check to see if parent has been marked artificially dirty.
   *
   * @internal
   */
  private _parentMarkedDirty(onlySelf?: boolean): boolean {
    const parentDirty = this._parent && this._parent.dirty;
    return !onlySelf && !!parentDirty && !this._parent!._anyControlsDirty();
  }

  /** @internal */
  _find(name: string | number): AbstractControl | null {
    return null;
  }
}
