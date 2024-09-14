export function AuthError(message?: string) {
  const error = new Error(message)
  error.name = "AuthError"
  Object.setPrototypeOf(error, AuthError.prototype)
  return error
}

AuthError.prototype = Object.create(Error.prototype)
AuthError.prototype.constructor = AuthError
