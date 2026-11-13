/**
 * ページ表示の計測（/api/pv へのアクセスを Cloudflare の集計で数える。中身は保存しない）
 * r: 流入元（direct / internal / google など）、p: ページの種類
 * a=1: ログイン中、d=1 / w=1 / m=1: このブラウザでその日・週・月（日本時間）の最初の表示、n=1: 初めての表示
 * → d=1 の数がその日の訪問者数（ブラウザ数）になる。ブラウザには最後に開いた日付だけを覚えさせ、利用者を見分ける ID は送らない
 * 最初の表示は hydration を待たずに送るため、同じ判定を HTML に埋め込むスクリプトにも持たせている（下の PAGE_VIEW_INLINE_SCRIPT）
 */

const SITE_HOSTS = /(^|\.)aipictors\.com$/

const REFERRER_RULES: [RegExp, string][] = [
  [/(^|\.)google\./, "google"],
  [/(^|\.)yahoo\./, "yahoo"],
  [/(^|\.)bing\.com$/, "bing"],
  [/(^|\.)duckduckgo\.com$/, "duckduckgo"],
  [/^(t\.co|(.+\.)?twitter\.com|(.+\.)?x\.com)$/, "x"],
  [/(^|\.)discord(app)?\.com$/, "discord"],
  [/(^|\.)pixiv\.net$/, "pixiv"],
  [/(^|\.)dlsite\.com$/, "dlsite"],
  [/(^|\.)(chatgpt\.com|openai\.com|perplexity\.ai|claude\.ai)$/, "ai"],
]

/** 参照元のホスト → 流入元の分類 */
export function classifyReferrer(referrer: string) {
  if (!referrer) return "direct"
  let host = ""
  try {
    host = new URL(referrer).hostname.toLowerCase()
  } catch {
    return "other"
  }
  if (SITE_HOSTS.test(host)) return "internal"
  for (const [pattern, name] of REFERRER_RULES) {
    if (pattern.test(host)) return name
  }
  return "other"
}

/** パス → ページの種類（/en は外して数える） */
export function classifyPath(pathname: string) {
  const path = pathname.replace(/^\/en(?=\/|$)/, "") || "/"
  if (path === "/") return "top"
  if (path.startsWith("/r/posts/")) return "r_post"
  if (/^\/posts\/\d+(\/|$)/.test(path)) return "post"
  if (/^\/r(\/|$)/.test(path)) return "r"
  if (/^\/generation(\/|$)/.test(path)) return "generation"
  if (/^\/(tags|search)(\/|$)/.test(path)) return "search"
  if (/^\/(rankings|ai-rankings)(\/|$)/.test(path)) return "ranking"
  if (/^\/(plus|plans)(\/|$)/.test(path)) return "plus"
  if (/^\/(events|themes)(\/|$)/.test(path)) return "event"
  if (/^\/models(\/|$)/.test(path)) return "model"
  if (/^\/(new|settings|admin|login|my)(\/|$)/.test(path)) return "app"
  return "other"
}

const VISIT_DAY_KEY = "aipictors.pvDay"

/** 月曜始まりの週の通し番号（1970-01-01 は木曜） */
const weekOf = (day: string) =>
  Math.floor((Date.parse(`${day}T00:00:00Z`) / 864e5 + 3) / 7)

/** 最後に開いた日（なければ null）と今日（どちらも日本時間の YYYY-MM-DD）→ 付ける印 */
export function visitFlags(last: string | null, today: string) {
  if (last === today) return ""
  const isKnown = last !== null && /^\d{4}-\d{2}-\d{2}$/.test(last)
  let flags = "&d=1"
  if (!isKnown || weekOf(last) !== weekOf(today)) flags += "&w=1"
  if (!isKnown || last.slice(0, 7) !== today.slice(0, 7)) flags += "&m=1"
  if (!isKnown) flags += "&n=1"
  return flags
}

/** ログイン中の印と訪問の印。日付を覚えられないブラウザ（保存できない設定）は訪問者に数えない */
function visitQuery() {
  let query = ""
  try {
    if (document.documentElement.dataset.aipAuth === "in") query = "&a=1"
    const today = new Date(Date.now() + 324e5).toISOString().slice(0, 10)
    const flags = visitFlags(localStorage.getItem(VISIT_DAY_KEY), today)
    if (flags) {
      localStorage.setItem(VISIT_DAY_KEY, today)
      query += flags
    }
  } catch {
    // 保存できないときは印を付けない
  }
  return query
}

export function trackPageView(source: string, pathname: string) {
  if (typeof window === "undefined") return
  const url = `/api/pv?r=${encodeURIComponent(source)}&p=${encodeURIComponent(classifyPath(pathname))}${visitQuery()}`
  fetch(url, { method: "GET", keepalive: true, cache: "no-store" }).catch(
    () => {},
  )
}

/** 最初の表示を送るスクリプト（上の判定と同じ。変えたら両方直す。テストで突き合わせている） */
export const PAGE_VIEW_INLINE_SCRIPT = `(function(){try{var s=/(^|\\.)aipictors\\.com$/,R=[[/(^|\\.)google\\./,"google"],[/(^|\\.)yahoo\\./,"yahoo"],[/(^|\\.)bing\\.com$/,"bing"],[/(^|\\.)duckduckgo\\.com$/,"duckduckgo"],[/^(t\\.co|(.+\\.)?twitter\\.com|(.+\\.)?x\\.com)$/,"x"],[/(^|\\.)discord(app)?\\.com$/,"discord"],[/(^|\\.)pixiv\\.net$/,"pixiv"],[/(^|\\.)dlsite\\.com$/,"dlsite"],[/(^|\\.)(chatgpt\\.com|openai\\.com|perplexity\\.ai|claude\\.ai)$/,"ai"]];function cr(f){if(!f)return"direct";var h="";try{h=new URL(f).hostname.toLowerCase()}catch(e){return"other"}if(s.test(h))return"internal";for(var i=0;i<R.length;i++)if(R[i][0].test(h))return R[i][1];return"other"}function cp(n){var p=n.replace(/^\\/en(?=\\/|$)/,"")||"/";if(p==="/")return"top";if(/^\\/r\\/posts\\//.test(p))return"r_post";if(/^\\/posts\\/\\d+(\\/|$)/.test(p))return"post";if(/^\\/r(\\/|$)/.test(p))return"r";if(/^\\/generation(\\/|$)/.test(p))return"generation";if(/^\\/(tags|search)(\\/|$)/.test(p))return"search";if(/^\\/(rankings|ai-rankings)(\\/|$)/.test(p))return"ranking";if(/^\\/(plus|plans)(\\/|$)/.test(p))return"plus";if(/^\\/(events|themes)(\\/|$)/.test(p))return"event";if(/^\\/models(\\/|$)/.test(p))return"model";if(/^\\/(new|settings|admin|login|my)(\\/|$)/.test(p))return"app";return"other"}function vf(l,t){if(l===t)return"";var k=l!==null&&/^\\d{4}-\\d{2}-\\d{2}$/.test(l),W=function(d){return Math.floor((Date.parse(d+"T00:00:00Z")/864e5+3)/7)},f="&d=1";if(!k||W(l)!==W(t))f+="&w=1";if(!k||l.slice(0,7)!==t.slice(0,7))f+="&m=1";if(!k)f+="&n=1";return f}function vq(){var q="";try{if(document.documentElement.dataset.aipAuth==="in")q="&a=1";var t=new Date(Date.now()+324e5).toISOString().slice(0,10),f=vf(localStorage.getItem("${VISIT_DAY_KEY}"),t);if(f){localStorage.setItem("${VISIT_DAY_KEY}",t);q+=f}}catch(e){}return q}window.__aipPv={cr:cr,cp:cp,vf:vf};if(navigator.webdriver)return;fetch("/api/pv?r="+encodeURIComponent(cr(document.referrer))+"&p="+encodeURIComponent(cp(location.pathname))+vq(),{keepalive:true,cache:"no-store"}).catch(function(){})}catch(e){}})()`
