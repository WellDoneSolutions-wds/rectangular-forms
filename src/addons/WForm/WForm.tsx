import React, {
  FC,
  ReactNode,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import {
  ControlContext,
  IControlContext,
} from "../WControlProvider/ControlContext";
import { FormConfig } from "./useForm";
import { IControlErrorMessages } from "../WControlProvider/useCurrentControl";

import { IFormConfig } from "../WForm/useForm";
import { FormGroup } from "../../exports";

export type STATUS = "PROCESSING" | "SUCCESS" | "FAILURE" | "";

export interface IFormContext extends IFormConfig {
  submitted: boolean;
  markAsSubmitted: () => void;
  globalErrorMessages?: IControlErrorMessages;
  submit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export const WFormContext = React.createContext<IFormContext>({
  form: new FormGroup({}),
  formLoadedData: null,
  formLoadParams: null,
  formLoadStatus: "",
  formLoadedError: null,
  formSavedData: null,
  formSaveParams: null,
  formSaveStatus: "",
  formSavedError: null,
  submit: () => {},
  submitted: false,
  markAsSubmitted: () => {},
});

type FormProps = React.DetailedHTMLProps<
  React.FormHTMLAttributes<HTMLFormElement>,
  HTMLFormElement
>;
export interface IWFormProps extends FormProps {
  formConfig: FormConfig;
  children?: ReactNode | ((params: IFormContext) => ReactNode);
  renderOnError?: (error: any) => ReactNode;
  globalErrorMessages?: IControlErrorMessages;
}

export const WForm: FC<IWFormProps> = (props) => {
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
    reset$,
  } = formConfig;
  const [submitted, setSubmitted] = useState(false);
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  useEffect(() => {
    reset$.subscribe(() => {
      setSubmitted(false);
      forceUpdate();
    });
  }, [reset$]);

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

  const formProps = {
    className: props.className,
    style: props.style,
  };

  return (
    <>
      {formLoadStatus && formLoadStatus !== "FAILURE" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setSubmitted(true);
            formConfig.submit(e);
          }}
          {...formProps}
        >
          <ControlContext.Provider value={controlContext}>
            <WFormContext.Provider value={formContextProvider}>
              {typeof children === "function"
                ? children(formContextProvider)
                : children}
            </WFormContext.Provider>
          </ControlContext.Provider>
        </form>
      )}
      {formLoadStatus === "FAILURE" && (
        <>{renderOnError && renderOnError(null)}</>
      )}
    </>
  );
};

export const useFormContext = () => {
  const formContext = useContext(WFormContext);
  return formContext;
};
