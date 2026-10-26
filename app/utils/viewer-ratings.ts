export type ViewerRating = "G" | "R15" | "R18" | "R18G"

export type ViewerPreferenceRating = "G" | "R15" | "R18" | "R18G"

/**
 * 通常モード（全年齢側）の一覧で表示するレーティング
 * - 未ログイン: 従来通り G と R15
 * - ログイン済み: 「(通常モード時)R15作品を表示する」がOFF（G）なら G のみ
 *   設定行が存在しないユーザは設定画面上OFFとして表示されるため G 扱いにする
 * @param props
 */
export function toNormalModeRatings(props: {
  isLoggedIn: boolean
  preferenceRating: ViewerPreferenceRating | null
}): ViewerRating[] {
  if (!props.isLoggedIn) {
    return ["G", "R15"]
  }

  if (props.preferenceRating === null || props.preferenceRating === "G") {
    return ["G"]
  }

  return ["G", "R15"]
}

/**
 * センシティブモード（R18側）の一覧で表示するレーティング
 * - 未ログイン: 従来通り R18 と R18G
 * - ログイン済み: 「(センシティブモード時)R18G作品を表示する」がONのときのみ R18G を含める
 * @param props
 */
export function toSensitiveModeRatings(props: {
  isLoggedIn: boolean
  preferenceRating: ViewerPreferenceRating | null
}): ViewerRating[] {
  if (!props.isLoggedIn) {
    return ["R18", "R18G"]
  }

  if (props.preferenceRating === "R18G") {
    return ["R18", "R18G"]
  }

  return ["R18"]
}
