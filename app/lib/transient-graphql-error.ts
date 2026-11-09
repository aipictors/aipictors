/**
 * サーバーの一時的な失敗（D1 の過負荷など）かどうか。少し待てば成功するので読み取りは再試行する
 */
const TRANSIENT_MESSAGE = /overloaded|システム内部でエラー|Unexpected error/i

export const hasTransientGraphQLError = (
  errors: ReadonlyArray<{ message: string }> | null | undefined,
) => errors?.some((error) => TRANSIENT_MESSAGE.test(error.message)) ?? false
