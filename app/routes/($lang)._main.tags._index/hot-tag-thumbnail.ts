/**
 * トレンドのタグのサムネイル。タグの作品から 1 件を年齢制限を見ずに選んでいるので、
 * 全年齢のページでは全年齢（G）の作品のときだけ出す（R15・R18 の画像が出ていた）
 */
export const toHotTagThumbnailUrl = (
  firstWork:
    | { smallThumbnailImageURL: string; rating: string | null }
    | null
    | undefined,
  isSensitive: boolean,
) => {
  if (!firstWork) return null
  if (!isSensitive && firstWork.rating !== "G") return null
  return firstWork.smallThumbnailImageURL
}
