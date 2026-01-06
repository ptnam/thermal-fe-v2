import { reactive, ref } from "vue";

export interface FormErrors {
  [key: string]: string;
}

export interface ValidationErrorResponse {
  errors: Record<string, string[]>;
  type?: string;
  title?: string;
  status?: number;
  traceId?: string;

  [key: string]: unknown;
}

type ErrorWithResponseData = { response?: { data?: unknown } };

export function useSimpleFormRequest<TModel = never, TResponse = unknown>() {
  const formErrors = reactive<FormErrors>({});
  const loading = ref(false);
  const model = ref<TModel>({} as TModel);

  const toFormErrors = (res: ValidationErrorResponse): FormErrors => {
    const out: FormErrors = {};
    const errors = res.errors ?? {};
    for (const [k, arr] of Object.entries(errors)) {
      out[k] = arr[0] ?? "";
    }
    return out;
  };
  const isValidationErrorResponse = (
    data: unknown,
  ): data is ValidationErrorResponse =>
    !!data && typeof data === "object" && "errors" in data;

  const getErrorData = (e: unknown): unknown => {
    if (typeof e !== "object" || e === null) return undefined;
    const resp = (e as ErrorWithResponseData).response;
    if (typeof resp !== "object" || resp === null) return undefined;
    return resp.data;
  };
  const submit = async <Args extends unknown[]>(
    requestFn: (...args: Args) => Promise<TResponse>,
    ...args: Args
  ): Promise<
    { success: true; data: TResponse } | { success: false; errors: FormErrors }
  > => {
    clearErrors();
    loading.value = true;

    try {
      const response = await requestFn(...args);
      return { success: true, data: response };
    } catch (err: unknown) {
      const data = getErrorData(err);
      let maybeErrors: FormErrors = {};

      if (isValidationErrorResponse(data)) {
        maybeErrors = toFormErrors(data);
        setErrors(maybeErrors);
      }
      return { success: false, errors: maybeErrors };
    } finally {
      loading.value = false;
    }
  };

  const loadModel = (values: Partial<TModel>) => {
    model.value = { ...model.value, ...values } as TModel;
  };

  const setErrors = (errors: FormErrors) => {
    Object.assign(formErrors, errors);
  };

  const clearErrors = () => {
    Object.keys(formErrors).forEach((key) => delete formErrors[key]);
  };

  return {
    model,
    loading,
    formErrors,
    loadModel,
    submit,
    clearErrors,
    setErrors,
  };
}
