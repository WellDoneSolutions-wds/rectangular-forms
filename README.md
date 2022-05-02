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
    </WForm>
  );
};
```

## License

[MIT](LICENSE)
