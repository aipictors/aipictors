// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class AuthError extends Error {
  static {
    AuthError.prototype.name = "AuthError"
  }
}
