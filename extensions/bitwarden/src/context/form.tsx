import { ReactNode, createContext, useContext, useRef, useState } from "react";

export type UseFormProps<TState extends RecordOfAny> = {
  defaultValues: TState;
};

export type UseFormReturnType<TState extends RecordOfAny> = {
  state: TState;
  setField: <TField extends keyof TState>(
    field: TField,
    value: TState[TField] | ((value: TState[TField]) => TState[TField])
  ) => void;
  handleSubmit: (handler: (state: TState) => void) => () => void;
  defaultValues: TState;
};

type SetStateAction<TState, TField extends keyof TState> = (currentValue: TState[TField]) => TState[TField];

export function useForm<TState extends RecordOfAny>(props: UseFormProps<TState>): UseFormReturnType<TState> {
  const [state, setState] = useState<TState>(props.defaultValues);
  const stateRef = useRef(props.defaultValues);

  const setField = <TField extends keyof TState>(
    field: TField,
    value: TState[TField] | SetStateAction<TState, TField>
  ) => {
    const getValue = (current: TState[TField]) => {
      return typeof value === "function" ? (value as SetStateAction<TState, TField>)(current) : value;
    };

    stateRef.current = { ...stateRef.current, [field]: getValue(stateRef.current[field]) };
    setState((current) => ({ ...current, [field]: getValue(current[field]) }));
  };

  const handleSubmit = (handler: (state: TState) => void) => () => {
    handler(stateRef.current);
  };

  return {
    state,
    setField,
    handleSubmit,
    defaultValues: props.defaultValues,
  };
}

const FormContext = createContext<UseFormReturnType<any>>({} as UseFormReturnType<any>);

export type FormProviderProps<TState extends RecordOfAny> = {
  children: ReactNode;
  formState: UseFormReturnType<TState>;
};

export function FormProvider<TState extends RecordOfAny>({ children, formState }: FormProviderProps<TState>) {
  return <FormContext.Provider value={formState}>{children}</FormContext.Provider>;
}

export function useFormContext<TState extends RecordOfAny>() {
  const context = useContext(FormContext);
  if (!context) throw new Error("useFormContext must be used within a FormProvider");

  return context as UseFormReturnType<TState>;
}
