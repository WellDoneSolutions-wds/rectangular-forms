import { FormGroup } from "../../..";

export interface UseFormGroupReturn {
  setFormGroup: (formGroup: FormGroup) => void;
  getFormGroup: () => FormGroup;
}
