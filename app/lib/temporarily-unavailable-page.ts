/**
 * DB の過負荷などでページを作れなかったときの画面。
 * 波は数十秒で収まるので、ブラウザでは自動で読み込み直す（同じページは 1 分に 3 回まで）。
 * 検索エンジンには 503 と Retry-After で「あとで来て」と伝える
 */
export const createTemporarilyUnavailablePage = (pathname: string) => {
  const isEn = /^\/en(?:\/|$)/.test(pathname)
  const title = isEn ? "We're a little busy" : "少し混み合っています"
  const waiting = isEn
    ? "We're a little busy right now. Reloading automatically…"
    : "少し混み合っています。自動で読み込み直しています…"
  const failed = isEn
    ? "This page could not be loaded. Please try again in a moment."
    : "読み込めませんでした。少し時間をおいてお試しください。"
  const reload = isEn ? "Reload" : "読み込み直す"

  const html = `<!DOCTYPE html><html lang="${isEn ? "en" : "ja"}"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><meta name="robots" content="noindex"/><title>${title} - Aipictors</title></head><body style="font-family:sans-serif;display:flex;min-height:100vh;margin:0;align-items:center;justify-content:center;text-align:center;padding:16px;box-sizing:border-box"><div><p id="m">${waiting}</p><p><a href="" onclick="location.reload();return false">${reload}</a></p></div><script>(function(){var k="aip-reload:"+location.pathname,s={};try{s=JSON.parse(sessionStorage.getItem(k)||"{}")}catch(e){}var n=Date.now()-(s.t||0)<60000?s.n||0:0;if(n<3){try{sessionStorage.setItem(k,JSON.stringify({n:n+1,t:Date.now()}))}catch(e){}setTimeout(function(){location.reload()},2000+n*3000)}else{document.getElementById("m").textContent=${JSON.stringify(failed)}}})()</script></body></html>`

  return new Response(html, {
    status: 503,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "Retry-After": "30",
    },
  })
}
