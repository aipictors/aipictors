/**
 * URLの不一致によるエラー
 */

export function ParamsError(message?: string) {
  const error = new Error(message)
  error.name = "ParamsError"
  Object.setPrototypeOf(error, ParamsError.prototype)
  return error
}

ParamsError.prototype = Object.create(Error.prototype)
ParamsError.prototype.constructor = ParamsError
