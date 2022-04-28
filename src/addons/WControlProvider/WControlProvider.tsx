import React, { FC } from "react";
import { ControlContext } from "./ControlContext";
import { IControlProvider, useCurrentControl } from "./useCurrentControl";

export const WControlProvider: FC<IControlProvider> = (props) => {
  const controlContext = useCurrentControl(props);
  const { status, errors } = controlContext;
  return (
    <>
      {status && status !== "FAILURE" && (
        <ControlContext.Provider value={controlContext}>
          {typeof props.children === "function"
            ? props.children(controlContext)
            : props.children}
        </ControlContext.Provider>
      )}
      {status === "FAILURE" && <>{JSON.stringify(errors)}</>}
    </>
  );
};
