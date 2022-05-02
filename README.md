# RectAngular Forms

This library adapt Angular Reactive Forms to being use on React. This library depends on rxjs.

## Installation

```sh
npm install rxjs --save

npm install rectangular-forms --save
```

## Basic Example

```js
import { useEffect } from "react";
import {
  FormControl,
  FormGroup,
  useFormConfig,
  WControlData,
  WForm,
  WFormControl,
} from "rectangular-forms";

export const Basic = () => {
  const formConfig = useFormConfig({
    createForm: (data) => {
      const form = new FormGroup({
        name: new FormControl(),
        lastname: new FormControl(),
        document: new FormGroup({
          type: new FormControl(),
          number: new FormControl(),
        }),
      });
      form.patchValue(data);
      return form;
    },
  });
  const { loadSucceed } = formConfig;

  useEffect(() => {
    loadSucceed({
      name: "Jhon",
      lastname: "Doe",
      document: {
        type: "PASSPORT",
        number: "2345656",
      },
    });
  }, [loadSucceed]);

  return (
    <WForm formConfig={formConfig}>
      <WControlData />
      {/* <WControlData/> show the data of this context */}

      <WFormControl name="name">
        {({ control }) => {
          const { value, onChange, onBlur, disabled } = control;
          return (
            <input
              value={value || ""}
              onChange={onChange}
              onBlur={onBlur}
              disabled={disabled}
            />
          );
        }}
      </WFormControl>

      <WFormControl name="type.document">
        {({ control }) => {
          const { value, onChange, onBlur, disabled } = control;
          return (
            <input
              value={value || ""}
              onChange={onChange}
              onBlur={onBlur}
              disabled={disabled}
            />
          );
        }}
      </WFormControl>
    </WForm>
  );
};
```

## Array With Nested Object Example

```js
import { useEffect } from "react";
import {
  FormArray,
  FormControl,
  FormGroup,
  useFormConfig,
  WControlData,
  WForm,
  WFormArrayElement,
  WFormControl,
  WFormGroup,
} from "rectangular-forms";

const createLineForm = () => {
  const form = new FormGroup({
    price: new FormControl(),
    quantity: new FormControl(),
  });
  return form;
};

export const Input = (props) => {
  const { control } = props;
  const { value, onChange, onBlur, disabled } = control;
  return (
    <input
      value={value || ""}
      onChange={onChange}
      onBlur={onBlur}
      disabled={disabled}
    />
  );
};

export const Array = () => {
  const formConfig = useFormConfig({
    createForm: (data) => {
      const lines: FormGroup[] = [];
      for (let index = 0; index < data.lines.length; index++) {
        lines.push(createLineForm());
      }
      const form = new FormGroup({
        name: new FormControl(),
        lastname: new FormControl(),
        document: new FormGroup({
          type: new FormControl(),
          number: new FormControl(),
        }),
        lines: new FormArray(lines),
      });
      form.patchValue(data);
      return form;
    },
  });
  const { loadSucceed } = formConfig;

  useEffect(() => {
    loadSucceed({
      name: "Jhon",
      lastname: "Doe",
      document: {
        type: "PASSPORT",
        number: "2345656",
      },
      lines: [
        { price: 2, quantity: 20 },
        { price: 4, quantity: 10 },
      ],
    });
  }, [loadSucceed]);

  return (
    <WForm formConfig={formConfig}>
      <WControlData />
      {/* <WControlData/> show the data of this context */}
      <WFormControl name="name">
        <Input />
      </WFormControl>

      <WFormControl name="type.document">
        <Input />
      </WFormControl>

      <table>
        <thead>
          <th>quantity</th>
          <th>price</th>
          <th>Add Line</th>
          <th>Remove Line</th>
        </thead>
        <tbody>
          <WFormArrayElement name="lines">
            <tr>
              <td>
                <WFormControl name="quantity">
                  <Input />
                </WFormControl>
              </td>
              <td>
                <WFormControl name="price">
                  <Input />
                </WFormControl>
              </td>
              <td>
                <WFormGroup>
                  {/* here the context is implicit   */}
                  {({ control }) => {
                    return (
                      <button
                        onClick={() => {
                          const linesFormArray = control.parent as FormArray;
                          linesFormArray.push(createLineForm());
                        }}
                      />
                    );
                  }}
                </WFormGroup>
              </td>
              <td>
                <WFormGroup>
                  {/* here the context is implicit   */}
                  {({ control, index }) => {
                    return (
                      <button
                        onClick={() => {
                          const linesFormArray = control.parent as FormArray;
                          linesFormArray.removeAt(index);
                        }}
                      />
                    );
                  }}
                </WFormGroup>
              </td>
            </tr>
          </WFormArrayElement>
        </tbody>
      </table>
    </WForm>
  );
};
```

## License

[MIT](LICENSE)
