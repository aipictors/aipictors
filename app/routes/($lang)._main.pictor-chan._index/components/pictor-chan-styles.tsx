/**
 * ぴくたーちゃんのページの動き（このページだけで使うので、ここに置く）。
 * 「動きを減らす」設定の人には、動かさない
 */
const CSS = `
.pkc-reveal { opacity: 0; transform: translateY(28px); transition: opacity .7s cubic-bezier(.2,.7,.2,1), transform .7s cubic-bezier(.2,.7,.2,1); }
.pkc-reveal[data-shown="true"] { opacity: 1; transform: none; }
@keyframes pkc-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
.pkc-float { animation: pkc-float 4.5s ease-in-out infinite; }
@keyframes pkc-pan { 0% { transform: translate3d(0,0,0) scale(1.12); } 100% { transform: translate3d(-9%,0,0) scale(1.12); } }
.pkc-pan { animation: pkc-pan 38s ease-in-out infinite alternate; transform-origin: left center; }
@keyframes pkc-shine { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }
.pkc-shine { background-size: 200% auto; animation: pkc-shine 6s linear infinite; }
@keyframes pkc-marquee { 0% { transform: translate3d(0,0,0); } 100% { transform: translate3d(-50%,0,0); } }
.pkc-marquee { animation: pkc-marquee 60s linear infinite; }
.pkc-marquee:hover { animation-play-state: paused; }
@keyframes pkc-twinkle { 0%,100% { opacity: 0; transform: scale(.4) rotate(0deg); } 50% { opacity: 1; transform: scale(1) rotate(45deg); } }
.pkc-twinkle { animation: pkc-twinkle 3.2s ease-in-out infinite; }
@keyframes pkc-petal { 0% { transform: translate3d(0,-10%,0) rotate(0deg); opacity: 0; } 10% { opacity: .9; } 100% { transform: translate3d(-140px,620px,0) rotate(540deg); opacity: 0; } }
.pkc-petal { animation: pkc-petal 9s linear infinite; }
@keyframes pkc-ring { 0% { box-shadow: 0 0 0 0 rgba(255,138,31,.55); } 100% { box-shadow: 0 0 0 18px rgba(255,138,31,0); } }
.pkc-ring { animation: pkc-ring 1.8s ease-out infinite; }
@keyframes pkc-spin { to { transform: rotate(360deg); } }
.pkc-spin { animation: pkc-spin 26s linear infinite; }
.pkc-card { transition: transform .25s ease, box-shadow .25s ease; }
.pkc-card:hover { transform: translateY(-4px); box-shadow: 0 18px 40px -18px rgba(29,47,143,.45); }
@media (prefers-reduced-motion: reduce) {
  .pkc-reveal { opacity: 1; transform: none; transition: none; }
  .pkc-float, .pkc-pan, .pkc-shine, .pkc-marquee, .pkc-twinkle, .pkc-petal, .pkc-ring, .pkc-spin { animation: none; }
  .pkc-petal, .pkc-twinkle { display: none; }
}
`

export function PictorChanStyles(): React.ReactNode {
  return (
    <>
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: 決まった文字列の CSS だけを入れている */}
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <noscript>
        <style>{".pkc-reveal{opacity:1;transform:none}"}</style>
      </noscript>
    </>
  )
}
