import React, { useEffect, useReducer, useRef, useState } from "react";
import { Subject } from "rxjs";
import { delay, filter, takeUntil, tap } from "rxjs/operators";
import { FormGroup } from "../../..";
import { UseFormGroupReturn } from "./model";

export const useFormGroup = (): UseFormGroupReturn => {
  const [, reRender] = useReducer((x) => x + 1, 0);
  const formGroupRef = useRef<FormGroup>(new FormGroup({}));
  const setFormGroup$Ref = useRef(new Subject<FormGroup>());
  const destroy$Ref = useRef(new Subject<void>());
  const setFormGroupRef = useRef(
    setFormGroup$Ref.current.next.bind(setFormGroup$Ref.current)
  );
  const getFormGroupRef = useRef(() => formGroupRef.current);

  useEffect(() => {
    setFormGroup$Ref.current
      .pipe(
        takeUntil(destroy$Ref.current),
        filter((formGroup: FormGroup) => formGroup !== formGroupRef.current),
        tap((formGroup: FormGroup) => {
          formGroupRef.current = formGroup;
          formGroupRef.current.forceUpdate = reRender;
        }),
        delay(1),
        tap(() => {
          reRender();
        })
      )
      .subscribe();
  }, []);

  return {
    setFormGroup: setFormGroupRef.current,
    getFormGroup: getFormGroupRef.current,
  };
};
