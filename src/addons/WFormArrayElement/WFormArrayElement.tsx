import React, { FC } from 'react';
import { WFormArray } from '../..';
import { AbstractControl } from "../../model/abstract_model";
import { FormArray } from "../../model/form_array";
import {
  ControlContext,
  IControlContext
} from "../WControlProvider/ControlContext";
import { IControlProvider } from "../WControlProvider/useCurrentControl";

interface IFormArrayElementProps
  extends Omit<IControlProvider<AbstractControl>, "expectedControl"> {
  getKey?: (control: AbstractControl, index: number) => any;
}

export const WFormArrayElement: FC<IFormArrayElementProps> = (props) => {
  const { getKey } = props;
  const newProps = { ...props, control: props.control as FormArray };
  return (
    <WFormArray {...newProps}>
      {({ control, status, errors, validationErrors, validationStatus }) => {
        return (
          <>
            {status === "SUCCESS" && (
              <>
                {(control as FormArray).controls.map((control, i) => {
                  const key = getKey ? getKey(control, i) : i.toString();
                  const parentControlContext: IControlContext = {
                    control,
                    status: "SUCCESS",
                    errors: null,
                    validationErrors,
                    validationStatus,
                  };

                  return (
                    <ControlContext.Provider
                      value={parentControlContext}
                      key={key}
                    >
                      {typeof props.children === "function"
                        ? props.children(parentControlContext)
                        : props.children}
                    </ControlContext.Provider>
                  );
                })}
              </>
            )}
            {status === "PROCESSING" && <></>}
            {status === "FAILURE" && <>{JSON.stringify(errors)}</>}
          </>
        );
      }}
    </WFormArray>
  );
};
