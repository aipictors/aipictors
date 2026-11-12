/**
 * 作品の一覧（新着・お題・検索など）でいいね数を隠す設定。端末ごとに覚える。
 * 作品ページや作品のダイアログ、ランキングの数は隠さない。
 * 一覧の側は、いいね数の要素に data-list-like-count を付けるだけでよい（app/tailwind.css で消す）
 */
const STORAGE_KEY = "aipictors.hideListLikeCounts"

const CHANGE_EVENT = "aipictors:list-like-count-change"

export const readListLikeCountHidden = (): boolean => {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1"
  } catch {
    return false
  }
}

export const saveListLikeCountHidden = (isHidden: boolean) => {
  try {
    if (isHidden) localStorage.setItem(STORAGE_KEY, "1")
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    // 保存できなくても、このページでは切り替わる
  }
  if (isHidden) document.documentElement.dataset.aipHideListLikes = "1"
  else delete document.documentElement.dataset.aipHideListLikes
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

/**
 * 設定が変わったときに呼ぶ（別のタブでの変更も含む）
 */
export const subscribeListLikeCountHidden = (onChange: () => void) => {
  window.addEventListener(CHANGE_EVENT, onChange)
  window.addEventListener("storage", onChange)
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange)
    window.removeEventListener("storage", onChange)
  }
}

/**
 * head に置く: 描画前に html へ書く（数字が一瞬見えてから消えるのを防ぐ）
 * 属性なので React の突き合わせには関わらない
 */
export const LIST_LIKE_COUNT_INLINE_SCRIPT = `try{if(localStorage.getItem("${STORAGE_KEY}")==="1")document.documentElement.dataset.aipHideListLikes="1"}catch(e){}`
