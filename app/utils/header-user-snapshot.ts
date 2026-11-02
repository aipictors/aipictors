/**
 * ヘッダーのアイコンを、ログイン確認（Firebase）とユーザー情報の取得を待たずに出すための控え
 * 最後に取得したアイコンを覚えておき、HTML の描画前に CSS 変数へ入れる
 */
const STORAGE_KEY = "aipictors.headerUser"

export type HeaderUserSnapshot = {
  iconUrl: string
}

export const readHeaderUserSnapshot = (): HeaderUserSnapshot | null => {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return value === null ? null : (JSON.parse(value) as HeaderUserSnapshot)
  } catch {
    return null
  }
}

export const saveHeaderUserSnapshot = (snapshot: HeaderUserSnapshot) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
  } catch {
    // 保存できなくても、読み込みを待つだけ
  }
}

export const clearHeaderUserSnapshot = () => {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // 同上
  }
}

/**
 * head に置く: ログイン中かどうか（hydration を待つかの判断と同じ条件）とアイコンを html に書く
 * 属性・CSS 変数なので React の突き合わせには関わらない
 */
export const HEADER_USER_INLINE_SCRIPT = `try{var d=document.documentElement,i=/login_token=/.test(document.cookie)||localStorage.getItem("login_user_token");d.dataset.aipAuth=i?"in":"out";if(i){var u=JSON.parse(localStorage.getItem("${STORAGE_KEY}")||"null");if(u&&u.iconUrl)d.style.setProperty("--aip-header-avatar",'url("'+encodeURI(u.iconUrl).replace(/["\\\\)]/g,"")+'")')}}catch(e){}`

/**
 * 描画前のログイン表示の切り替え（CSS 本体を待たないよう head に直接書く）
 */
export const HEADER_USER_INLINE_STYLE =
  ".aip-auth-guest{display:none}html[data-aip-auth=out] .aip-auth-guest{display:flex}html[data-aip-auth=out] .aip-auth-user{display:none}.aip-auth-bell{visibility:hidden}html[data-aip-auth=in] .aip-auth-bell{visibility:visible}html[data-aip-auth=in] .aip-auth-bell-box{background:transparent}.aip-auth-avatar{background-image:var(--aip-header-avatar);background-size:cover;background-position:center}"
