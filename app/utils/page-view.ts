/**
 * ページ表示の計測（/api/pv へのアクセスを Cloudflare の集計で数える。中身は保存しない）
 * r: 流入元（direct / internal / google など）、p: ページの種類
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

export function trackPageView(source: string, pathname: string) {
  if (typeof window === "undefined") return
  const url = `/api/pv?r=${encodeURIComponent(source)}&p=${encodeURIComponent(classifyPath(pathname))}`
  fetch(url, { method: "GET", keepalive: true, cache: "no-store" }).catch(
    () => {},
  )
}

/** 最初の表示を送るスクリプト（上の 2 つの判定と同じ。変えたら両方直す。テストで突き合わせている） */
export const PAGE_VIEW_INLINE_SCRIPT = `(function(){try{var s=/(^|\\.)aipictors\\.com$/,R=[[/(^|\\.)google\\./,"google"],[/(^|\\.)yahoo\\./,"yahoo"],[/(^|\\.)bing\\.com$/,"bing"],[/(^|\\.)duckduckgo\\.com$/,"duckduckgo"],[/^(t\\.co|(.+\\.)?twitter\\.com|(.+\\.)?x\\.com)$/,"x"],[/(^|\\.)discord(app)?\\.com$/,"discord"],[/(^|\\.)pixiv\\.net$/,"pixiv"],[/(^|\\.)dlsite\\.com$/,"dlsite"],[/(^|\\.)(chatgpt\\.com|openai\\.com|perplexity\\.ai|claude\\.ai)$/,"ai"]];function cr(f){if(!f)return"direct";var h="";try{h=new URL(f).hostname.toLowerCase()}catch(e){return"other"}if(s.test(h))return"internal";for(var i=0;i<R.length;i++)if(R[i][0].test(h))return R[i][1];return"other"}function cp(n){var p=n.replace(/^\\/en(?=\\/|$)/,"")||"/";if(p==="/")return"top";if(/^\\/r\\/posts\\//.test(p))return"r_post";if(/^\\/posts\\/\\d+(\\/|$)/.test(p))return"post";if(/^\\/r(\\/|$)/.test(p))return"r";if(/^\\/generation(\\/|$)/.test(p))return"generation";if(/^\\/(tags|search)(\\/|$)/.test(p))return"search";if(/^\\/(rankings|ai-rankings)(\\/|$)/.test(p))return"ranking";if(/^\\/(plus|plans)(\\/|$)/.test(p))return"plus";if(/^\\/(events|themes)(\\/|$)/.test(p))return"event";if(/^\\/models(\\/|$)/.test(p))return"model";if(/^\\/(new|settings|admin|login|my)(\\/|$)/.test(p))return"app";return"other"}window.__aipPv={cr:cr,cp:cp};if(navigator.webdriver)return;fetch("/api/pv?r="+encodeURIComponent(cr(document.referrer))+"&p="+encodeURIComponent(cp(location.pathname)),{keepalive:true,cache:"no-store"}).catch(function(){})}catch(e){}})()`
