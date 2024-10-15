/**
 * URLの不一致によるエラー
 */

export class ParamsError extends Error {
  constructor(message?: string) {
    super(message)
    this.name = "ParamsError"
  }
}
