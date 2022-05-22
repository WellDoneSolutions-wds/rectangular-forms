import React, { FC } from "react";
import { FormArray } from "../..";
import { IControlProvider } from "../WControlProvider/useCurrentControl";
import { WControlProvider } from "../WControlProvider/WControlProvider";

type IFormArrayProps = Omit<IControlProvider, "expectedControl">;

export const WFormArray: FC<IFormArrayProps> = (props) => {
  return <WControlProvider {...props} expectedControl={FormArray} />;
};
