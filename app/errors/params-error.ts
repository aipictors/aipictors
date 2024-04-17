/**
 * URLの不一致によるエラー
 * biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
 */
export class ParamsError extends Error {
  static {
    ParamsError.prototype.name = "ParamsError"
  }
}
