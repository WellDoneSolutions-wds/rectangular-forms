import React, { FC } from "react";
import { useControlContext } from "../WControlProvider/ControlContext";

export const WControlData: FC = () => {
  const { control } = useControlContext();
  const data = control && control.value;
  return (
    <pre>
      {data !== undefined ? JSON.stringify(data, null, 2) : "No control found"}
    </pre>
  );
};
