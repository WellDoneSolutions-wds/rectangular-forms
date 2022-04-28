import React from "react";
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormControlStatus,
  FormGroup,
} from "../../exports";
import { STATUS } from "../WForm/WForm";

export interface IControlContext<T extends AbstractControl = AbstractControl> {
  status: STATUS;
  control: T | FormGroup | FormArray | FormControl;
  errors: any;

  validationStatus?: FormControlStatus;
  validationErrors?: {
    [key: string]: any;
  } | null;
}

export function createControlContext<
  T extends AbstractControl = AbstractControl
>() {
  return React.createContext<IControlContext<T>>({
    status: "",
    control: new FormGroup({}),
    errors: null,
    validationStatus: undefined,
    validationErrors: undefined,
  });
}

export const ControlContext = createControlContext();

export const useControlContext = <T extends AbstractControl = FormGroup>() => {
  return React.useContext(ControlContext) as IControlContext<T>;
};
