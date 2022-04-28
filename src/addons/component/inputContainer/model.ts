import React from "react";
import { AbstractControl, FormControl } from "../../..";

export type EnumStatusType =
  | "WAITING"
  | "PROCESSING"
  | "SUCCESS"
  | "ERROR"
  | "CANCELED";

export interface IAsyncCallExecution<T = any> {
  status?: EnumStatusType;
  data?: T;
  error?: any;
  config?: any;
}

export interface IInputContainerRenderInputParams {
  control: FormControl;
  data: any;
  validationStatus?: EnumStatusType;
  showErrors: boolean;
}

export type IInputContainerPropsRenderLabelParams = {
  showErrors: boolean;
  validationStatus: EnumStatusType;
};
export type IInputContainerPropsRenderLabel = (
  params: IInputContainerPropsRenderLabelParams
) => React.ReactFragment;
export type IInputContainerPropsRenderInput = (
  params: IInputContainerRenderInputParams
) => React.ReactFragment;
export type IInputContainerPropsRenderProcessing = () => React.ReactFragment;
export type IInputContainerPropsRenderValidationErrors = (params: {
  errors: any;
  control: AbstractControl;
}) => React.ReactFragment;
export type IInputContainerPropsRenderReload = (
  error: any
) => React.ReactFragment;
export type IInputContainerPropsShowErrorsFn = (
  control: AbstractControl
) => boolean;

export type IInputContainerPropsData = {
  load?: IAsyncCallExecution;
  renderReload?: IInputContainerPropsRenderReload;
};
export interface IInputContainerProps {
  formLoadStatus?: EnumStatusType;
  control: AbstractControl;
  renderInput: IInputContainerPropsRenderInput;
  data?: IInputContainerPropsData;
  renderProcessing?: IInputContainerPropsRenderProcessing;
  renderLabel?: IInputContainerPropsRenderLabel;
  renderValidationErrors?: IInputContainerPropsRenderValidationErrors;
  showErrorsFn?: IInputContainerPropsShowErrorsFn;
}
