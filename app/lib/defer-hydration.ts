/**
 * Remix が出す JS の読み込み（<link rel="modulepreload"> と body の最後の <script type="module">）を、
 * ブラウザが最初の描画を済ませてから始めるように書き換える。
 *
 * そのままだと HTML を読んでいる間に 100 本以上の JS の取得が始まり、
 * 回線の遅いスマホでは HTML・CSS・最初の画像と回線を取り合って表示が遅れる
 * （Lighthouse のモバイル計測でも、表示前に取り終えた JS はすべて表示に必要なものとして数えられる）。
 *
 * hydration で React が DOM を突き合わせるので、要素は足したり消したりしない。
 * - modulepreload は rel を読み込まない値に変えておき、描画後に戻す
 * - module script は、描画を待ってから元の中身を Blob のモジュールとして実行する
 *   （静的 import のまま実行するので、評価の順番や manifest を入れるタイミングは元と同じ）
 */

const DEFERRED_REL = "aipictors-deferred-modulepreload"

/**
 * Remix の module script の中身を、描画を待ってから実行するものに変える
 */
export const toDeferredModuleScript = (source: string): string => {
  const json = JSON.stringify(source).replaceAll("<", "\\u003c")
  // 最初の描画を待つ（first-contentful-paint か、2 フレーム描画されたとき。中身が画像や文字でないページもあるため）。
  // 裏のタブでは描画されないので待たない。万一描画が来なくても 5 秒で始める
  // （以前は 1 秒で始めていたが、計測環境では描画より先に JS の読み込みが始まっていた）
  // そのあと、優先して読む画像（fetchpriority="high"、ページで最初に大きく見える作品）が読み終わるのも待つ。
  // JS と回線を取り合うと、いちばん大きい画像（LCP）の表示が遅れるため。こちらは最大 1.5 秒で打ち切る
  return `await new Promise(function(r){if(document.visibilityState==="hidden"){r();return}var d=false;function f(){if(!d){d=true;setTimeout(r,0)}}try{new PerformanceObserver(function(l){if(l.getEntriesByName("first-contentful-paint").length>0)f()}).observe({type:"paint",buffered:true})}catch(e){}requestAnimationFrame(function(){requestAnimationFrame(f)});setTimeout(f,5000)});
await Promise.race([Promise.all(Array.prototype.map.call(document.querySelectorAll('img[fetchpriority="high"]'),function(i){return i.complete?0:new Promise(function(r){i.addEventListener("load",r,{once:true});i.addEventListener("error",r,{once:true})})})),new Promise(function(r){setTimeout(r,1500)})]);
document.querySelectorAll('link[rel="${DEFERRED_REL}"]').forEach(function(l){l.rel="modulepreload"});
const source = ${json}.replace(/(from\\s*|import\\s*\\(\\s*|import\\s+)"\\//g, "$1\\"" + location.origin + "/");
await import(URL.createObjectURL(new Blob([source], { type: "text/javascript" })));`
}

export const deferHydration = (response: Response): Response => {
  const contentType = response.headers.get("Content-Type") ?? ""
  if (!contentType.includes("text/html") || !response.body) return response

  let source = ""

  return new HTMLRewriter()
    .on('link[rel="modulepreload"]', {
      element(element) {
        element.setAttribute("rel", DEFERRED_REL)
      },
    })
    .on('script[type="module"]', {
      text(chunk) {
        source += chunk.text
        if (!chunk.lastInTextNode) {
          chunk.remove()
          return
        }
        const replaced = source.includes("window.__remixRouteModules")
          ? toDeferredModuleScript(source)
          : source
        chunk.replace(replaced, { html: true })
        source = ""
      },
    })
    .transform(response)
}
