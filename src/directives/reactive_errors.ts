/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  formArrayNameExample,
  formControlNameExample,
  formGroupNameExample,
  ngModelGroupExample,
} from "./error_examples";

export function controlParentException(): Error {
  return new Error(
    `formControlName must be used with a parent formGroup directive.  You'll want to add a formGroup
       directive and pass it an existing FormGroup instance (you can create one in your class).
 
     Example:
 
     ${formControlNameExample}`
  );
}

export function ngModelGroupException(): Error {
  return new Error(
    `formControlName cannot be used with an ngModelGroup parent. It is only compatible with parents
       that also have a "form" prefix: formGroupName, formArrayName, or formGroup.
 
       Option 1:  Update the parent to be formGroupName (reactive form strategy)
 
       ${formGroupNameExample}
 
       Option 2: Use ngModel instead of formControlName (template-driven strategy)
 
       ${ngModelGroupExample}`
  );
}

export function missingFormException(): Error {
  return new Error(`formGroup expects a FormGroup instance. Please pass one in.
 
       Example:
 
       ${formControlNameExample}`);
}

export function groupParentException(): Error {
  return new Error(
    `formGroupName must be used with a parent formGroup directive.  You'll want to add a formGroup
     directive and pass it an existing FormGroup instance (you can create one in your class).
 
     Example:
 
     ${formGroupNameExample}`
  );
}

export function arrayParentException(): Error {
  return new Error(
    `formArrayName must be used with a parent formGroup directive.  You'll want to add a formGroup
       directive and pass it an existing FormGroup instance (you can create one in your class).
 
       Example:
 
       ${formArrayNameExample}`
  );
}

export const disabledAttrWarning = `
   It looks like you're using the disabled attribute with a reactive form directive. If you set disabled to true
   when you set up this control in your component class, the disabled attribute will actually be set in the DOM for
   you. We recommend using this approach to avoid 'changed after checked' errors.
 
   Example:
   form = new FormGroup({
     first: new FormControl({value: 'Nancy', disabled: true}, Validators.required),
     last: new FormControl('Drew', Validators.required)
   });
 `;

export function ngModelWarning(directiveName: string): string {
  return `
   It looks like you're using ngModel on the same form field as ${directiveName}.
   Support for using the ngModel input property and ngModelChange event with
   reactive form directives has been deprecated in Angular v6 and will be removed
   in a future version of Angular.
 
   For more information on this, see our API docs here:
   https://angular.io/api/forms/${
     directiveName === "formControl"
       ? "FormControlDirective"
       : "FormControlName"
   }#use-with-ngmodel
   `;
}

function describeKey(isFormGroup: boolean, key: string | number): string {
  return isFormGroup ? `with name: '${key}'` : `at index: ${key}`;
}

export function noControlsError(isFormGroup: boolean): string {
  return `
     There are no form controls registered with this ${
       isFormGroup ? "group" : "array"
     } yet. If you're using ngModel,
     you may want to check next tick (e.g. use setTimeout).
   `;
}

export function missingControlError(
  isFormGroup: boolean,
  key: string | number
): string {
  return `Cannot find form control ${describeKey(isFormGroup, key)}`;
}

export function missingControlValueError(
  isFormGroup: boolean,
  key: string | number
): string {
  return `Must supply a value for form control ${describeKey(
    isFormGroup,
    key
  )}`;
}
