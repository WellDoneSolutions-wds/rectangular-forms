import { useEffect, useRef, useState } from "react";
import { map, startWith, tap } from "rxjs/operators";
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormControlStatus,
  FormGroup,
} from "../../exports";
import { IControlContext, useControlContext } from "./ControlContext";
import { STATUS, useFormContext } from "../WForm/WForm";

interface ICurrentControl<T extends AbstractControl = AbstractControl> {
  name?: string;
  inputControl?: T;
  errorMessages?: IControlErrorMessages;
  onChange?: (params: {
    value: any;
    prevValue: any;
    control: T | null;
    parentControl: AbstractControl;
    rootControl?: AbstractControl | null;
  }) => void;
}

interface IUseCurrentControlProps<T extends AbstractControl>
  extends ICurrentControl<T> {
  expectedControl: any;
}

export const useCurrentControl = <T extends AbstractControl>(
  props: IUseCurrentControlProps<T>
): IControlContext<T> => {
  const { inputControl, name, expectedControl, onChange, errorMessages } =
    props;
  const { control, status, errors } = useControlContext<T>();

  const [loadControl, setLoadControl] = useState<{
    status: STATUS;
    control: T | FormGroup | FormArray | FormControl;
    errors: any;
  }>({ status: "", control: new FormControl(), errors: null });

  useEffect(() => {
    if (status === "SUCCESS") return;
    setLoadControl({ control, status, errors });
  }, [status, control, errors]);

  const formContext = useFormContext();
  const { submitted, globalErrorMessages, form } = formContext;
  const prevValueRef = useRef<any>();
  useEffect(() => {
    let currentControl: T | null = null;
    if (status !== "SUCCESS") return;
    try {
      if (!inputControl) {
        if (name) {
          if (!control) return;
          if (!(control instanceof FormGroup)) {
            const messageError = {
              code: `ParentControl is not instance of ${expectedControl} name:${name}`,
            };
            throw messageError;
          }
          const childControl = control.get(name);
          if (!childControl) {
            const messageError = {
              code: `Control with name :${name} was not found.`,
            };
            throw messageError;
          }
          currentControl = childControl as T;
        } else {
          currentControl = control as T;
        }
      } else {
        currentControl = control as T;
      }
      if (currentControl instanceof expectedControl) {
        const messageError = {
          code: `Control with name :${name} is not instance of ${expectedControl}.`,
        };
        throw messageError;
      }

      setLoadControl({
        status: "SUCCESS",
        control: currentControl,
        errors: null,
      });
    } catch (errors) {
      setLoadControl((loadControl) => ({
        ...loadControl,
        status: "FAILURE",
        errors,
      }));
    }
  }, [name, inputControl, status, control, expectedControl]);

  const [internalValidation, setInternalValidation] = useState<{
    status?: FormControlStatus;
    errors: { [key: string]: any } | null;
  }>({
    errors: null,
  });

  const [validation, setValidation] = useState<{
    status?: FormControlStatus;
    errors: { [key: string]: any } | null;
  }>({
    errors: null,
  });

  useEffect(() => {
    if (loadControl.status !== "SUCCESS") return;
    const subs = loadControl.control.statusChanges
      .pipe(
        startWith(loadControl.control.status),
        map((status) => {
          return {
            status,
            errors: loadControl.control.errors,
          };
        }),
        tap((validation) => {
          if (validation.status !== "INVALID") {
            setValidation(validation);
          }
          setInternalValidation(validation);
        })
      )
      .subscribe();

    return () => {
      subs.unsubscribe();
    };
  }, [loadControl.control, loadControl.status]);

  const [displayErrors, setDisplayErrors] = useState(false);

  const touched = loadControl.control && loadControl.control.touched;
  const dirty = loadControl.control && loadControl.control.dirty;

  useEffect(() => {
    const displayErrors = (touched && dirty) || submitted;
    setDisplayErrors(displayErrors);
  }, [touched, dirty, submitted]);

  const subscriberRef = useRef<any>();

  useEffect(() => {
    if (loadControl.status !== "SUCCESS") return;
    if (subscriberRef.current) return;
    if (onChange) {
      subscriberRef.current = onChange;
    }
  }, [onChange, loadControl.status]);

  useEffect(() => {
    if (loadControl.status !== "SUCCESS") return;
    const subscriber = subscriberRef.current;
    if (!subscriber) return;
    loadControl.control.valueChanges.subscribe((value) => {
      subscriber({
        value,
        prevValue: prevValueRef.current,
        control: loadControl.control,
        parentControl: control,
        rootControl: form,
      });
      prevValueRef.current = value;
    });
  }, [control, form, loadControl.status, loadControl.control]);

  useEffect(() => {
    const { errors, status } = internalValidation;
    if (status !== "INVALID") return;
    if (!displayErrors) return;
    const errorsCalculated = Object.keys(errors || {}).reduce((t, e) => {
      const value =
        (errorMessages || {})[e] || (globalErrorMessages || {})[e] || e;
      const errorValue =
        typeof value === "function" ? value(errors![e]) : value;
      t[e] = errorValue;
      return t;
    }, {} as { [key: string]: any });

    setValidation({ errors: errorsCalculated, status });
  }, [internalValidation, globalErrorMessages, errorMessages, displayErrors]);

  const controlContext: IControlContext<T> = {
    status: loadControl.status,
    control: loadControl.control || new FormControl(),
    errors: loadControl.errors,
    validationStatus: validation.status,
    validationErrors: validation.errors,
  };
  return controlContext;
};

export interface IControlErrorMessages {
  [key: string]: any | ((errorValue: any) => any);
}

export interface IControlProvider<T extends AbstractControl = AbstractControl>
  extends ICurrentControl<T> {
  name?: string;
  control?: T;
  showErrors?: (
    control: T,
    parentControl: AbstractControl,
    isSubmitted: boolean
  ) => boolean;
  children?:
    | React.ReactNode
    | ((config: IControlContext<T>) => React.ReactNode);
  expectedControl: any;
}
