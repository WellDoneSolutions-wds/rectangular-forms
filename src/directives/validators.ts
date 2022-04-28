/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { Observable } from "rxjs";
import { coerceToBoolean } from "../core/utils/coercion";

import { AbstractControl } from "../model/abstract_model";
import {
  emailValidator,
  maxLengthValidator,
  maxValidator,
  minLengthValidator,
  minValidator,
  nullValidator,
  patternValidator,
  requiredTrueValidator,
  requiredValidator,
} from "../validators";

/**
 * Method that updates string to integer if not already a number
 *
 * @param value The value to convert to integer.
 * @returns value of parameter converted to number or integer.
 */
function toInteger(value: string | number): number {
  return typeof value === "number" ? value : parseInt(value, 10);
}

/**
 * Method that ensures that provided value is a float (and converts it to float if needed).
 *
 * @param value The value to convert to float.
 * @returns value of parameter converted to number or float.
 */
function toFloat(value: string | number): number {
  return typeof value === "number" ? value : parseFloat(value);
}

/**
 * @description
 * Defines the map of errors returned from failed validation checks.
 *
 * @publicApi
 */
export type ValidationErrors = {
  [key: string]: any;
};

/**
 * @description
 * An interface implemented by classes that perform synchronous validation.
 *
 * @usageNotes
 *
 * ### Provide a custom validator
 *
 * The following example implements the `Validator` interface to create a
 * validator directive with a custom error key.
 *
 * ```typescript
 * @Directive({
 *   selector: '[customValidator]',
 *   providers: [{provide: NG_VALIDATORS, useExisting: CustomValidatorDirective, multi: true}]
 * })
 * class CustomValidatorDirective implements Validator {
 *   validate(control: AbstractControl): ValidationErrors|null {
 *     return {'custom': true};
 *   }
 * }
 * ```
 *
 * @publicApi
 */
export interface Validator {
  /**
   * @description
   * Method that performs synchronous validation against the provided control.
   *
   * @param control The control to validate against.
   *
   * @returns A map of validation errors if validation fails,
   * otherwise null.
   */
  validate(control: AbstractControl): ValidationErrors | null;

  /**
   * @description
   * Registers a callback function to call when the validator inputs change.
   *
   * @param fn The callback function
   */
  registerOnValidatorChange?(fn: () => void): void;
}

/**
 * A base class for Validator-based Directives. The class contains common logic shared across such
 * Directives.
 *
 * For internal use only, this class is not intended for use outside of the Forms package.
 */
abstract class AbstractValidatorDirective implements Validator {
  private _validator: ValidatorFn = nullValidator;
  private _onChange!: () => void;

  /**
   * A flag that tracks whether this validator is enabled.
   *
   * Marking it `internal` (vs `protected`), so that this flag can be used in host bindings of
   * directive classes that extend this base class.
   * @internal
   */
  _enabled?: boolean;

  /**
   * Name of an input that matches directive selector attribute (e.g. `minlength` for
   * `MinLengthDirective`). An input with a given name might contain configuration information (like
   * `minlength='10'`) or a flag that indicates whether validator should be enabled (like
   * `[required]='false'`).
   *
   * @internal
   */
  abstract inputName: string;

  /**
   * Creates an instance of a validator (specific to a directive that extends this base class).
   *
   * @internal
   */
  abstract createValidator(input: unknown): ValidatorFn;

  /**
   * Performs the necessary input normalization based on a specific logic of a Directive.
   * For example, the function might be used to convert string-based representation of the
   * `minlength` input to an integer value that can later be used in the `Validators.minLength`
   * validator.
   *
   * @internal
   */
  abstract normalizeInput(input: unknown): unknown;

  /** @nodoc */
  validate(control: AbstractControl): ValidationErrors | null {
    return this._validator(control);
  }

  /** @nodoc */
  registerOnValidatorChange(fn: () => void): void {
    this._onChange = fn;
  }

  /**
   * @description
   * Determines whether this validator should be active or not based on an input.
   * Base class implementation checks whether an input is defined (if the value is different from
   * `null` and `undefined`). Validator classes that extend this base class can override this
   * function with the logic specific to a particular validator directive.
   */
  enabled(input: unknown): boolean {
    return input != null /* both `null` and `undefined` */;
  }
}

/**
 * A directive which installs the {@link MaxValidator} for any `formControlName`,
 * `formControl`, or control with `ngModel` that also has a `max` attribute.
 *
 * @see [Form Validation](guide/form-validation)
 *
 * @usageNotes
 *
 * ### Adding a max validator
 *
 * The following example shows how to add a max validator to an input attached to an
 * ngModel binding.
 *
 * ```html
 * <input type="number" ngModel max="4">
 * ```
 *
 * @ngModule ReactiveFormsModule
 * @ngModule FormsModule
 * @publicApi
 */
export class MaxValidator extends AbstractValidatorDirective {
  /**
   * @description
   * Tracks changes to the max bound to this directive.
   */
  max!: string | number | null;
  /** @internal */
  override inputName = "max";
  /** @internal */
  override normalizeInput = (input: string | number): number => toFloat(input);
  /** @internal */
  override createValidator = (max: number): ValidatorFn => maxValidator(max);
}

/**
 * A directive which installs the {@link MinValidator} for any `formControlName`,
 * `formControl`, or control with `ngModel` that also has a `min` attribute.
 *
 * @see [Form Validation](guide/form-validation)
 *
 * @usageNotes
 *
 * ### Adding a min validator
 *
 * The following example shows how to add a min validator to an input attached to an
 * ngModel binding.
 *
 * ```html
 * <input type="number" ngModel min="4">
 * ```
 *
 * @ngModule ReactiveFormsModule
 * @ngModule FormsModule
 * @publicApi
 */
export class MinValidator extends AbstractValidatorDirective {
  /**
   * @description
   * Tracks changes to the min bound to this directive.
   */
  min!: string | number | null;
  /** @internal */
  override inputName = "min";
  /** @internal */
  override normalizeInput = (input: string | number): number => toFloat(input);
  /** @internal */
  override createValidator = (min: number): ValidatorFn => minValidator(min);
}

/**
 * @description
 * An interface implemented by classes that perform asynchronous validation.
 *
 * @usageNotes
 *
 * ### Provide a custom async validator directive
 *
 * The following example implements the `AsyncValidator` interface to create an
 * async validator directive with a custom error key.
 *
 * ```typescript
 * import { of } from 'rxjs';
 *
 * @Directive({
 *   selector: '[customAsyncValidator]',
 *   providers: [{provide: NG_ASYNC_VALIDATORS, useExisting: CustomAsyncValidatorDirective, multi:
 * true}]
 * })
 * class CustomAsyncValidatorDirective implements AsyncValidator {
 *   validate(control: AbstractControl): Observable<ValidationErrors|null> {
 *     return of({'custom': true});
 *   }
 * }
 * ```
 *
 * @publicApi
 */
export interface AsyncValidator extends Validator {
  /**
   * @description
   * Method that performs async validation against the provided control.
   *
   * @param control The control to validate against.
   *
   * @returns A promise or observable that resolves a map of validation errors
   * if validation fails, otherwise null.
   */
  validate(
    control: AbstractControl
  ): Promise<ValidationErrors | null> | Observable<ValidationErrors | null>;
}

/**
 * @description
 * A directive that adds the `required` validator to any controls marked with the
 * `required` attribute. The directive is provided with the `NG_VALIDATORS` multi-provider list.
 *
 * @see [Form Validation](guide/form-validation)
 *
 * @usageNotes
 *
 * ### Adding a required validator using template-driven forms
 *
 * ```
 * <input name="fullName" ngModel required>
 * ```
 *
 * @ngModule FormsModule
 * @ngModule ReactiveFormsModule
 * @publicApi
 */
export class RequiredValidator extends AbstractValidatorDirective {
  /**
   * @description
   * Tracks changes to the required attribute bound to this directive.
   */
  required!: boolean | string;

  /** @internal */
  override inputName = "required";

  /** @internal */
  override normalizeInput = coerceToBoolean;

  /** @internal */
  override createValidator = (input: boolean): ValidatorFn => requiredValidator;

  /** @nodoc */
  override enabled(input: boolean): boolean {
    return input;
  }
}

/**
 * A Directive that adds the `required` validator to checkbox controls marked with the
 * `required` attribute. The directive is provided with the `NG_VALIDATORS` multi-provider list.
 *
 * @see [Form Validation](guide/form-validation)
 *
 * @usageNotes
 *
 * ### Adding a required checkbox validator using template-driven forms
 *
 * The following example shows how to add a checkbox required validator to an input attached to an
 * ngModel binding.
 *
 * ```
 * <input type="checkbox" name="active" ngModel required>
 * ```
 *
 * @publicApi
 * @ngModule FormsModule
 * @ngModule ReactiveFormsModule
 */
export class CheckboxRequiredValidator extends RequiredValidator {
  /** @internal */
  override createValidator = (input: unknown): ValidatorFn =>
    requiredTrueValidator;
}

/**
 * A directive that adds the `email` validator to controls marked with the
 * `email` attribute. The directive is provided with the `NG_VALIDATORS` multi-provider list.
 *
 * The email validation is based on the WHATWG HTML specification with some enhancements to
 * incorporate more RFC rules. More information can be found on the [Validators.email
 * page](api/forms/Validators#email).
 *
 * @see [Form Validation](guide/form-validation)
 *
 * @usageNotes
 *
 * ### Adding an email validator
 *
 * The following example shows how to add an email validator to an input attached to an ngModel
 * binding.
 *
 * ```
 * <input type="email" name="email" ngModel email>
 * <input type="email" name="email" ngModel email="true">
 * <input type="email" name="email" ngModel [email]="true">
 * ```
 *
 * @publicApi
 * @ngModule FormsModule
 * @ngModule ReactiveFormsModule
 */
export class EmailValidator extends AbstractValidatorDirective {
  /**
   * @description
   * Tracks changes to the email attribute bound to this directive.
   */
  email!: boolean | string;

  /** @internal */
  override inputName = "email";

  /** @internal */
  override normalizeInput = coerceToBoolean;

  /** @internal */
  override createValidator = (input: number): ValidatorFn => emailValidator;

  /** @nodoc */
  override enabled(input: boolean): boolean {
    return input;
  }
}

/**
 * @description
 * A function that receives a control and synchronously returns a map of
 * validation errors if present, otherwise null.
 *
 * @publicApi
 */
export interface ValidatorFn {
  (control: AbstractControl): ValidationErrors | null;
}

/**
 * @description
 * A function that receives a control and returns a Promise or observable
 * that emits validation errors if present, otherwise null.
 *
 * @publicApi
 */
export interface AsyncValidatorFn {
  (control: AbstractControl):
    | Promise<ValidationErrors | null>
    | Observable<ValidationErrors | null>;
}

/**
 * A directive that adds minimum length validation to controls marked with the
 * `minlength` attribute. The directive is provided with the `NG_VALIDATORS` multi-provider list.
 *
 * @see [Form Validation](guide/form-validation)
 *
 * @usageNotes
 *
 * ### Adding a minimum length validator
 *
 * The following example shows how to add a minimum length validator to an input attached to an
 * ngModel binding.
 *
 * ```html
 * <input name="firstName" ngModel minlength="4">
 * ```
 *
 * @ngModule ReactiveFormsModule
 * @ngModule FormsModule
 * @publicApi
 */
export class MinLengthValidator extends AbstractValidatorDirective {
  /**
   * @description
   * Tracks changes to the minimum length bound to this directive.
   */
  minlength!: string | number | null;

  /** @internal */
  override inputName = "minlength";

  /** @internal */
  override normalizeInput = (input: string | number): number =>
    toInteger(input);

  /** @internal */
  override createValidator = (minlength: number): ValidatorFn =>
    minLengthValidator(minlength);
}

/**
 * A directive that adds max length validation to controls marked with the
 * `maxlength` attribute. The directive is provided with the `NG_VALIDATORS` multi-provider list.
 *
 * @see [Form Validation](guide/form-validation)
 *
 * @usageNotes
 *
 * ### Adding a maximum length validator
 *
 * The following example shows how to add a maximum length validator to an input attached to an
 * ngModel binding.
 *
 * ```html
 * <input name="firstName" ngModel maxlength="25">
 * ```
 *
 * @ngModule ReactiveFormsModule
 * @ngModule FormsModule
 * @publicApi
 */
export class MaxLengthValidator extends AbstractValidatorDirective {
  /**
   * @description
   * Tracks changes to the minimum length bound to this directive.
   */
  maxlength!: string | number | null;

  /** @internal */
  override inputName = "maxlength";

  /** @internal */
  override normalizeInput = (input: string | number): number =>
    toInteger(input);

  /** @internal */
  override createValidator = (maxlength: number): ValidatorFn =>
    maxLengthValidator(maxlength);
}

/**
 * @description
 * A directive that adds regex pattern validation to controls marked with the
 * `pattern` attribute. The regex must match the entire control value.
 * The directive is provided with the `NG_VALIDATORS` multi-provider list.
 *
 * @see [Form Validation](guide/form-validation)
 *
 * @usageNotes
 *
 * ### Adding a pattern validator
 *
 * The following example shows how to add a pattern validator to an input attached to an
 * ngModel binding.
 *
 * ```html
 * <input name="firstName" ngModel pattern="[a-zA-Z ]*">
 * ```
 *
 * @ngModule ReactiveFormsModule
 * @ngModule FormsModule
 * @publicApi
 */
export class PatternValidator extends AbstractValidatorDirective {
  /**
   * @description
   * Tracks changes to the pattern bound to this directive.
   */
  pattern!: string | RegExp; // This input is always defined, since the name matches selector.

  /** @internal */
  override inputName = "pattern";

  /** @internal */
  override normalizeInput = (input: string | RegExp): string | RegExp => input;

  /** @internal */
  override createValidator = (input: string | RegExp): ValidatorFn =>
    patternValidator(input);
}
