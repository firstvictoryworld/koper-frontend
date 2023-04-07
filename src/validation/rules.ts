import i18n from '@/locales/index'

type ValidationResult = boolean | string
export type ValidationRule = (value: string|boolean|number|any[]) => ValidationResult

export const requiredValidation: ValidationRule = (value) => {
  if (Array.isArray(value) && !value.length) {
    return i18n.global.t('validation.requiredOne')
  }
  if (value !== false && value !== 0 && !value) {
    return i18n.global.t('validation.required')
  }
  return true
}

const testString = (value: any, regexp: RegExp, errorString: string) => {
  try {
    if (regexp.test(value)) {
      return true
    }
    throw new Error()
  } catch (error) {
    return i18n.global.t(errorString)
  }
}

export const emailValidation: ValidationRule = (value) => {
  return testString(value, /.+@.+\..+/, 'validation.email')
}

export const passwordValidation: ValidationRule = (value) => {
  return testString(value, /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, 'validation.password')
}

export const pivaValidation: ValidationRule = (value) => {
  return testString(value, /^[0-9]{11}$/, 'validation.piva')
}

export const codFiscaleValidation: ValidationRule = (value) => {
  return testString(value, /^[A-Z]{6}[0-9LMNPQRSTUV]{2}[A-Z]{1}[0-7LMNPQRST]{1}[0-9LMNPQRSTUV]{1}[A-Z]{1}[0-9LMNPQRSTUV]{3}[A-Z]{1}$/, 'validation.codFiscale')
}

export const codFiscaleOrPivaValidation: ValidationRule = (value) => {
  return !value || (pivaValidation(value) === true || codFiscaleValidation(value))
}

export const currencyValidation: ValidationRule = (value) => {
  return testString(value, /^(-)?([0-9])+([.,][0-9]{1,2})?$/, 'validation.currency')
}
