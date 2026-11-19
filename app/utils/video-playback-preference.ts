/**
 * 作品ページの動画の見方の設定。端末ごとに覚える（サーバーには送らない）。
 * - 自動再生: 画面に入ったら音なしで再生するか。既定はする（オフにすると再生ボタンで待つ）
 * - ループ: 動画ごとに切り替える。切り替えていない動画は既定のループする
 * - キャプション: 画像の拡大表示や動画の下に、キャプションを並べて出すか
 */
const AUTO_PLAY_KEY = "aipictors.videoAutoPlay"
const LOOP_KEY = "aipictors.videoLoop"
const CAPTION_KEY = "aipictors.viewerCaption"

/** ループを覚えておく動画の数（古いものから捨てる） */
export const MAX_LOOP_ENTRIES = 200

export const DEFAULT_VIDEO_AUTO_PLAY = true
export const DEFAULT_VIDEO_LOOP = true

export const readVideoAutoPlay = (): boolean => {
  try {
    return localStorage.getItem(AUTO_PLAY_KEY) !== "0"
  } catch {
    return DEFAULT_VIDEO_AUTO_PLAY
  }
}

export const saveVideoAutoPlay = (isAutoPlay: boolean) => {
  try {
    if (isAutoPlay) localStorage.removeItem(AUTO_PLAY_KEY)
    else localStorage.setItem(AUTO_PLAY_KEY, "0")
  } catch {
    // 保存できなくても、このページでは切り替わる
  }
}

const readLoopEntries = (): [string, boolean][] => {
  try {
    const parsed = JSON.parse(localStorage.getItem(LOOP_KEY) ?? "[]")
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (entry): entry is [string, boolean] =>
        Array.isArray(entry) &&
        typeof entry[0] === "string" &&
        typeof entry[1] === "boolean",
    )
  } catch {
    return []
  }
}

/** 動画ごとのループ。切り替えたことがなければ既定（ループする） */
export const readVideoLoop = (videoKey: string): boolean => {
  const entry = readLoopEntries().find(([key]) => key === videoKey)
  return entry ? entry[1] : DEFAULT_VIDEO_LOOP
}

export const saveVideoLoop = (videoKey: string, isLoop: boolean) => {
  // 既定に戻したら記録を消す。新しく切り替えたものを末尾に置き、多すぎたら先頭から捨てる
  const entries = readLoopEntries().filter(([key]) => key !== videoKey)
  if (isLoop !== DEFAULT_VIDEO_LOOP) entries.push([videoKey, isLoop])
  try {
    if (entries.length === 0) localStorage.removeItem(LOOP_KEY)
    else
      localStorage.setItem(
        LOOP_KEY,
        JSON.stringify(entries.slice(-MAX_LOOP_ENTRIES)),
      )
  } catch {
    // 保存できなくても、このページでは切り替わる
  }
}

/** キャプションを並べて出すか。既定は出さない（今までの表示のまま） */
export const readViewerCaptionShown = (): boolean => {
  try {
    return localStorage.getItem(CAPTION_KEY) === "1"
  } catch {
    return false
  }
}

export const saveViewerCaptionShown = (isShown: boolean) => {
  try {
    if (isShown) localStorage.setItem(CAPTION_KEY, "1")
    else localStorage.removeItem(CAPTION_KEY)
  } catch {
    // 保存できなくても、このページでは切り替わる
  }
}
