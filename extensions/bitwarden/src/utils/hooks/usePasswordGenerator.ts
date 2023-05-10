import { LocalStorage } from "@raycast/api";
import { useEffect, useReducer } from "react";
import { LOCAL_STORAGE_KEY } from "~/constants/general";
import { PasswordGeneratorOptions } from "~/types/passwords";
import useAbortController from "~/utils/hooks/useAbortController";
import { useBitwarden } from "~/context/bitwarden";
import { getPasswordGeneratorOptions } from "~/utils/passwords";

type GeneratorState = {
  options: PasswordGeneratorOptions | undefined;
  password: string | undefined;
  isGenerating: boolean;
};

const getInitialPasswordGeneratorState = (generateOnMount: boolean): GeneratorState => ({
  options: undefined as PasswordGeneratorOptions | undefined,
  password: undefined as string | undefined,
  isGenerating: generateOnMount,
});

type GeneratorActions =
  | { type: "generate" }
  | { type: "setPassword"; password: string }
  | { type: "setOptions"; options: PasswordGeneratorOptions }
  | { type: "cancelGenerate" }
  | { type: "clearPassword"; password: string };

const passwordReducer = (state: GeneratorState, action: GeneratorActions): GeneratorState => {
  switch (action.type) {
    case "generate":
      return { ...state, isGenerating: true };
    case "setPassword":
      return { ...state, password: action.password, isGenerating: false };
    case "setOptions":
      return { ...state, options: action.options };
    case "cancelGenerate":
      return { ...state, isGenerating: false };
    case "clearPassword":
      return { ...state, isGenerating: false, password: undefined };
  }
};

export type UsePasswordGeneratorOptions = {
  generateOnMount: boolean;
};

function usePasswordGenerator(options?: UsePasswordGeneratorOptions) {
  const { generateOnMount = true } = options ?? {};
  const bitwarden = useBitwarden();
  const [{ options: generatorOptions, ...state }, dispatch] = useReducer(
    passwordReducer,
    getInitialPasswordGeneratorState(generateOnMount)
  );
  const { abortControllerRef, renew: renewAbortController, abort: abortPreviousGenerate } = useAbortController();

  const generatePassword = async (passwordOptions = generatorOptions) => {
    try {
      renewAbortController();
      dispatch({ type: "generate" });
      const password = await bitwarden.generatePassword(passwordOptions, abortControllerRef?.current);
      dispatch({ type: "setPassword", password });
      return password;
    } catch (error) {
      // generate password was likely aborted
      if (abortControllerRef?.current.signal.aborted) {
        dispatch({ type: "cancelGenerate" });
      }
    }
  };

  const regeneratePassword = async () => {
    if (state.isGenerating) return;
    return generatePassword();
  };

  const setOption = async <Option extends keyof PasswordGeneratorOptions>(
    option: Option,
    value: PasswordGeneratorOptions[Option]
  ) => {
    if (!generatorOptions || generatorOptions[option] === value) return;
    if (state.isGenerating) {
      abortPreviousGenerate();
    }

    const newOptions = { ...generatorOptions, [option]: value };
    dispatch({ type: "setOptions", options: newOptions });
    await Promise.all([
      LocalStorage.setItem(LOCAL_STORAGE_KEY.PASSWORD_OPTIONS, JSON.stringify(newOptions)),
      generatePassword(newOptions),
    ]);
  };

  const restoreStoredOptions = async () => {
    const newOptions = await getPasswordGeneratorOptions();
    dispatch({ type: "setOptions", options: newOptions });
    if (generateOnMount) await generatePassword(newOptions);
  };

  useEffect(() => {
    void restoreStoredOptions();
  }, []);

  return { ...state, regeneratePassword, options: generatorOptions, setOption };
}

export default usePasswordGenerator;
