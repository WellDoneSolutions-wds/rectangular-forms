import React, { PureComponent } from "react";
import { Subject } from "rxjs";
import { map, startWith, takeUntil, tap } from "rxjs/operators";
import {
  AbstractControl,
  EnumStatusType,
  FormControl,
  IAsyncCallExecution,
} from "../../..";
import {
  IInputContainerProps,
  IInputContainerPropsData,
  IInputContainerPropsShowErrorsFn,
} from "./model";

export class InputContainer extends PureComponent<
  IInputContainerProps,
  IAsyncCallExecution
> {
  constructor(props: any) {
    super(props);
    this.state = {
      status: "SUCCESS",
    };
    this.initializeControl.bind(this);
  }

  destroy$: Subject<void> = new Subject<void>();
  componentDidMount() {
    const control = this.props.control;
    control && this.initializeControl(control);
  }

  initializeControl(control: AbstractControl) {
    control.statusChanges
      .pipe(
        takeUntil(this.destroy$),
        startWith(control.status),
        map((statusType: string): IAsyncCallExecution => {
          if (statusType === "INVALID") {
            return {
              status: "ERROR",
              error: control.errors,
            };
          } else if (statusType === "PENDING") {
            return {
              status: "PROCESSING",
              data: {},
            };
          }
          return {
            status: "SUCCESS",
            data: {},
          };
        }),
        tap((execution: IAsyncCallExecution) => {
          this.setState({
            data: execution.data,
            error: execution.error,
            status: execution.status,
          });
        })
      )
      .subscribe();
  }

  componentDidUpdate(prevProps: IInputContainerProps) {
    let newControl = this.props.control;
    if (newControl && prevProps.control !== newControl) {
      this.initializeControl(newControl);
    }
  }

  componentWillUnmount() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  render() {
    const control = this.props.control as FormControl;
    const showErrorsFn: IInputContainerPropsShowErrorsFn = this.props
      .showErrorsFn
      ? this.props.showErrorsFn
      : () => true;
    const formLoadStatus: EnumStatusType = this.props.formLoadStatus
      ? this.props.formLoadStatus
      : "SUCCESS";
    const showErrors = control ? showErrorsFn(control) : false;
    const data: IInputContainerPropsData = this.props.data
      ? this.props.data
      : {};
    const dataLoadStatus: IAsyncCallExecution = data.load
      ? data.load
      : { status: "SUCCESS" };
    const renderLabel = this.props.renderLabel;
    const labelTemplate =
      renderLabel &&
      renderLabel({
        showErrors,
        validationStatus: this.state.status!,
      });
    const renderInput = this.props.renderInput;
    const inputTemplate =
      control &&
      formLoadStatus === "SUCCESS" &&
      dataLoadStatus.status === "SUCCESS" &&
      renderInput({
        control,
        data: dataLoadStatus.data,
        validationStatus: this.state.status,
        showErrors,
      });

    const renderProcessing = this.props.renderProcessing;
    const processingTemplate =
      (formLoadStatus === "PROCESSING" ||
        dataLoadStatus.status === "PROCESSING") &&
      renderProcessing &&
      renderProcessing();

    const renderValidationErrors = this.props.renderValidationErrors;
    const validationErrorsTemplate =
      control &&
      formLoadStatus === "SUCCESS" &&
      dataLoadStatus.status === "SUCCESS" &&
      showErrors &&
      renderValidationErrors &&
      renderValidationErrors({ errors: this.state.error, control });
    const renderReload = data.renderReload;
    const reloadTemplate =
      dataLoadStatus.status === "ERROR" &&
      renderReload &&
      renderReload(dataLoadStatus.error);

    return (
      <>
        {formLoadStatus !== "ERROR" && (
          <>
            {labelTemplate}
            {inputTemplate}
            {processingTemplate}
            {validationErrorsTemplate}
            {reloadTemplate}
          </>
        )}
        {formLoadStatus === "SUCCESS" &&
          dataLoadStatus.status === "SUCCESS" &&
          !this.props.control && <></>}
      </>
    );
  }
}
