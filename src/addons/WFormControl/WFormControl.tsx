import React, { FC } from "react";
import { IControlProvider } from "../WControlProvider/useCurrentControl";
import { WControlProvider } from "../WControlProvider/WControlProvider";

type IFormControlProps = Omit<IControlProvider, "expectedControl">;

export const WFormControl: FC<IFormControlProps> = (props) => {
  return <WControlProvider {...props} expectedControl="FormControl" />;
};
