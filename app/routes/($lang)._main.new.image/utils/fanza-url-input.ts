const isR18Rating = (rating: string | null | undefined) =>
  rating === "R18" || rating === "R18G"

/**
 * 投稿で送る FANZA の販売ページの URL。R18 の作品で入力があるときだけ送る
 */
export const toCreateFanzaUrl = (
  url: string | null | undefined,
  rating: string | null | undefined,
): string | undefined => {
  const value = url?.trim() ?? ""
  return value !== "" && isR18Rating(rating) ? value : undefined
}

/**
 * 編集で送る FANZA の販売ページの URL。作品の値を読めていなければ送らない（消さないように）。空文字は消す
 */
export const toUpdateFanzaUrl = (
  url: string | null | undefined,
): string | undefined => {
  return url === undefined || url === null ? undefined : url.trim()
}
