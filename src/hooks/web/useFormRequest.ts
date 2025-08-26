import { reactive, ref } from 'vue'

export function useFormRequest() {
  const formErrors = reactive<Record<string, any>>({})
  const loading = ref(false)

  const submit = async (requestFn: (...args: any[]) => Promise<any>, ...args: any[]) => {
    clearErrors()
    loading.value = true

    try {
      const response = await requestFn(...args)
      return { success: true, data: response }
    } catch (err: any) {
      const errors = err?.response?.data?.errors ?? {}
      setErrors(errors)
      return { success: false, errors }
    } finally {
      loading.value = false
    }
  }

  const setErrors = (errors: Record<string, string>) => {
    Object.assign(formErrors, errors)
  }

  const clearErrors = () => {
    Object.keys(formErrors).forEach((key) => delete formErrors[key])
  }

  return {
    formErrors,
    submit,
    loading,
    clearErrors,
    setErrors,
  }
}
