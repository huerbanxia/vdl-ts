const useEnv = (value: any): string | boolean => {
  if (value === 'true') {
    return true
  } else if (value === 'false') {
    return false
  }
  return value
}
export { useEnv }
