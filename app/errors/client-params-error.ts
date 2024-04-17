/**
 * URLの不一致によるエラー
 * biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
 */
export class ClientParamsError extends Error {
  static {
    ClientParamsError.prototype.name = "ClientParamsError"
  }
}
