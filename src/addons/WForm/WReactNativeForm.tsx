import React, { FC, useState } from "react";
import { IFormContext, IWFormProps, WFormContext } from "../..";
import {
  ControlContext,
  IControlContext,
} from "../WControlProvider/ControlContext";

export const WReactNativeForm: FC<IWFormProps> = (props) => {
  const { formConfig, renderOnError, children, globalErrorMessages } = props;

  const {
    submit,
    formLoadStatus,
    form,
    formLoadedError,
    formLoadedData,
    formLoadParams,
    formSaveStatus,
    formSavedError,
    formSavedData,
    formSaveParams,
  } = formConfig;
  const [submitted, setSubmitted] = useState(false);

  const formContextProvider: IFormContext = {
    form,
    formLoadedData,
    formLoadParams,
    formLoadStatus,
    formLoadedError,
    formSavedData,
    formSaveParams,
    formSaveStatus,
    formSavedError,
    submitted,
    markAsSubmitted: () => {
      setSubmitted(true);
    },
    globalErrorMessages,
    submit,
  };

  const controlContext: IControlContext = {
    status: formLoadStatus,
    control: form,
    errors: formLoadedError,
  };

  return (
    <>
      {formLoadStatus && formLoadStatus !== "FAILURE" ? (
        <React.Fragment>
          <ControlContext.Provider value={controlContext}>
            <WFormContext.Provider value={formContextProvider}>
              {typeof children === "function"
                ? children(formContextProvider)
                : children}
            </WFormContext.Provider>
          </ControlContext.Provider>
        </React.Fragment>
      ) : null}
      {formLoadStatus === "FAILURE" ? (
        <>{renderOnError && renderOnError(null)}</>
      ) : null}
    </>
  );
};
