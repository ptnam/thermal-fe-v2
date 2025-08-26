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