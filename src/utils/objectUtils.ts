export const removeAllObjectInObject = (formData: object) => {
    Object.keys(formData).forEach(key => {
        if (typeof formData[key] === 'object' && formData[key] !== null) {
            delete formData[key];
        }
    });
    return formData
}
export const cloneObject = (value: any, defaultValue: any = {}) => {
    if(!value) {
        return defaultValue
    }
    return JSON.parse(JSON.stringify(value));
}

export const buildFormData = (
  data: Record<string, any>,
  formData: FormData = new FormData(),
  parentKey?: string,
): FormData => {
  if (!data) return formData

  Object.keys(data).forEach((key) => {
    const value = data[key]

    const formKey = parentKey
      ? `${parentKey}[${key}]`
      : key

    if (value === null || value === undefined) {
      return
    }

    // File hoặc Blob
    if (value instanceof File || value instanceof Blob) {
      formData.append(formKey, value)
    }

    // Array
    else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        const arrayKey = `${formKey}[${index}]`

        if (item instanceof File || item instanceof Blob) {
          formData.append(arrayKey, item)
        } else if (typeof item === 'object') {
          buildFormData(item, formData, arrayKey)
        } else {
          formData.append(arrayKey, String(item))
        }
      })
    }

    // Object
    else if (typeof value === 'object') {
      buildFormData(value, formData, formKey)
    }

    // Primitive
    else {
      formData.append(formKey, String(value))
    }
  })

  return formData
}