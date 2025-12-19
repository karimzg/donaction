export const isBoolean = (value: any): value is boolean => {
  return typeof value === 'boolean';
}
export const isTrueOrFalse = (value: any): boolean => {
  return value === true || value === false;
}
export const isNotNullOrUndefined = (value: any): boolean => {
  return value !== null && value !== undefined;
}
export const isArray = (value: any, length?: number): boolean => {
  if (!Array.isArray(value)) {
    return false;
  }
  if (length !== null) {
    return value.length === length;
  }
  return true;
}
