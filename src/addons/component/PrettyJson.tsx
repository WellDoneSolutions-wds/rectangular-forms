import React, { FC } from "react";

interface PrettyJsonProps {
  data: any;
}

export const PrettyJson: FC<PrettyJsonProps> = (props) => {
  return (
    <div>
      <pre>{JSON.stringify(props.data, null, 2)}</pre>
    </div>
  );
};
