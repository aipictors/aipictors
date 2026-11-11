/**
 * 作品の本文（Markdown ファイル）を取得する
 * 本文ファイルは編集のたびに同じ URL へ上書きされ、Cache-Control が付いていない。
 * そのままだとブラウザが Last-Modified から推測した期間だけ古い本文を使い回し、
 * 更新した直後の下書き・編集画面に更新前の本文が出る（そのまま更新すると古い本文で上書きされる）。
 * 毎回 ETag で確かめる（変わっていなければ 304 で済む）
 */
export const fetchMarkdownText = async (url: string): Promise<string> => {
  const response = await fetch(url, { cache: "no-cache" })
  return response.text()
}
