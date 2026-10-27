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
  // 裏のタブでは requestAnimationFrame が動かないので、見えていないときは待たない
  return `await new Promise(function(r){if(document.visibilityState==="hidden"){r();return}var d=false;function f(){if(!d){d=true;r()}}requestAnimationFrame(function(){setTimeout(f,0)});setTimeout(f,1000)});
document.querySelectorAll('link[rel="${DEFERRED_REL}"]').forEach(function(l){l.rel="modulepreload"});
const source = ${json}.replace(/(from\\s*|import\\s*\\(\\s*)"\\//g, "$1\\"" + location.origin + "/");
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
