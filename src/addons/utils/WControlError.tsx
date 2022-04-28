import React, { FC, ReactNode } from "react";
import { AbstractControl } from "../../exports";
import { useControlContext } from "../WControlProvider/ControlContext";

interface IControlErrors {
  control?: AbstractControl;
  children: (message: any, key: string) => ReactNode;
}
export const ControlErrors: FC<IControlErrors> = (props) => {
  const { validationErrors } = useControlContext();
  const errors = validationErrors || {};
  const messages = Object.keys(errors).map((key) => ({
    key,
    value: errors[key],
  }));

  return (
    <>
      {messages.map((message) => {
        return (
          <React.Fragment key={message.key}>
            {props.children(message.value, message.key)}
          </React.Fragment>
        );
      })}
    </>
  );
};

export const WControlErrors: FC = () => {
  const { control } = useControlContext();
  const errors = control && control.errors;
  return (
    <pre>{errors ? JSON.stringify(errors, null, 2) : "No errors found"}</pre>
  );
};
