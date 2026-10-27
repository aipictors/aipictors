/**
 * JSON-LD を <script> に埋め込むための文字列にする。
 * 作品タイトルなどユーザーが入力した文字列に "</script>" が含まれていても
 * スクリプトが閉じられないよう、<, >, & をエスケープする。
 */
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
}
