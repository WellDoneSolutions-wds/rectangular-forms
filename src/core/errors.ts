/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { ERROR_DETAILS_PAGE_BASE_URL } from "./error_details_base_url";

/**
 * The list of error codes used in runtime code of the `core` package.
 * Reserved error code range: 100-999.
 *
 * Note: the minus sign denotes the fact that a particular code has a detailed guide on
 * angular.io. This extra annotation is needed to avoid introducing a separate set to store
 * error codes which have guides, which might leak into runtime code.
 *
 * Full list of available error guides can be found at https://angular.io/errors.
 */
export const enum RuntimeErrorCode {
  // Change Detection Errors
  EXPRESSION_CHANGED_AFTER_CHECKED = -100,
  RECURSIVE_APPLICATION_REF_TICK = 101,

  // Dependency Injection Errors
  CYCLIC_DI_DEPENDENCY = -200,
  PROVIDER_NOT_FOUND = -201,
  INVALID_FACTORY_DEPENDENCY = 202,
  MISSING_INJECTION_CONTEXT = 203,
  INVALID_INJECTION_TOKEN = 204,
  INJECTOR_ALREADY_DESTROYED = 205,

  // Template Errors
  MULTIPLE_COMPONENTS_MATCH = -300,
  EXPORT_NOT_FOUND = -301,
  PIPE_NOT_FOUND = -302,
  UNKNOWN_BINDING = 303,
  UNKNOWN_ELEMENT = 304,
  TEMPLATE_STRUCTURE_ERROR = 305,
  INVALID_EVENT_BINDING = 306,

  // Bootstrap Errors
  MULTIPLE_PLATFORMS = 400,
  PLATFORM_NOT_FOUND = 401,
  ERROR_HANDLER_NOT_FOUND = 402,
  BOOTSTRAP_COMPONENTS_NOT_FOUND = 403,
  ALREADY_DESTROYED_PLATFORM = 404,
  ASYNC_INITIALIZERS_STILL_RUNNING = 405,

  // Styling Errors

  // Declarations Errors

  // i18n Errors
  INVALID_I18N_STRUCTURE = 700,

  // JIT Compilation Errors
  // Other
  INVALID_DIFFER_INPUT = 900,
  NO_SUPPORTING_DIFFER_FACTORY = 901,
  VIEW_ALREADY_ATTACHED = 902,
  INVALID_INHERITANCE = 903,
  UNSAFE_VALUE_IN_RESOURCE_URL = 904,
  UNSAFE_VALUE_IN_SCRIPT = 905,
}

/**
 * Class that represents a runtime error.
 * Formats and outputs the error message in a consistent way.
 *
 * Example:
 * ```
 *  throw new RuntimeError(
 *    RuntimeErrorCode.INJECTOR_ALREADY_DESTROYED,
 *    ngDevMode && 'Injector has already been destroyed.');
 * ```
 *
 * Note: the `message` argument contains a descriptive error message as a string in development
 * mode (when the `ngDevMode` is defined). In production mode (after tree-shaking pass), the
 * `message` argument becomes `false`, thus we account for it in the typings and the runtime logic.
 */
export class RuntimeError<T extends number = RuntimeErrorCode> extends Error {
  constructor(public code: T, message: null | false | string) {
    super(formatRuntimeError<T>(code, message));
  }
}

/**
 * Called to format a runtime error.
 * See additional info on the `message` argument type in the `RuntimeError` class description.
 */
export function formatRuntimeError<T extends number = RuntimeErrorCode>(
  code: T,
  message: null | false | string
): string {
  // Error code might be a negative number, which is a special marker that instructs the logic to
  // generate a link to the error details page on angular.io.
  const fullCode = `NG0${Math.abs(code)}`;

  let errorMessage = `${fullCode}${message ? ": " + message : ""}`;

  if (code < 0) {
    errorMessage = `${errorMessage}. Find more at ${ERROR_DETAILS_PAGE_BASE_URL}/${fullCode}`;
  }
  return errorMessage;
}
