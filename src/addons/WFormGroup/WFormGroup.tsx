import React, { FC } from 'react';
import { IControlProvider } from "../WControlProvider/useCurrentControl";
import { WControlProvider } from "../WControlProvider/WControlProvider";

type IFormGroupProps = Omit<IControlProvider, "expectedControl">;

export const WFormGroup: FC<IFormGroupProps> = (props) => {
  return <WControlProvider {...props} expectedControl="FormGroup" />;
};
