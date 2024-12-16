import { useState } from "react";

type FormState = {
  success: boolean;
  error: boolean | string;
};

type ActionFunction = (
  currentState: FormState,
  formData: FormData
) => Promise<void>;

export const useFormState = (
  actionFunction: ActionFunction,
  initialState: FormState
) => {
  const [state, setState] = useState<FormState>(initialState);

  const formAction = async (formData: FormData) => {
    try {
      await actionFunction(state, formData); // Pass `state` as `currentState`
      setState({ success: true, error: false });
    } catch (error: any) {
      setState({ success: false, error: error.message || "An error occurred" });
    }
  };

  return [state, formAction] as const;
};
