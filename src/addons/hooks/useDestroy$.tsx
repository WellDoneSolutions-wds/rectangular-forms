import { useEffect, useRef } from "react";
import { Subject } from "rxjs";

export const useDetroy$ = (): Subject<void> => {
  const destroy$Ref = useRef<Subject<void>>(new Subject<void>());
  const destroy$ = destroy$Ref.current;
  useEffect(() => {
    return () => {
      destroy$.next();
      destroy$.complete();
    };
  }, [destroy$]);
  return destroy$;
};
