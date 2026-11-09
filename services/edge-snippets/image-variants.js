// Cloudflare Snippet（ルール: www の /_w/*）。縮小版が R2 にあれば Worker を起動せずに返す
export default {
  async fetch(request) {
    const path = new URL(request.url).pathname
    if (request.method === "GET" && path.startsWith("/_w/")) {
      const variant = await fetch("https://variants.aipictors.com/v2/" + path.slice(4))
      if (variant.ok) {
        const response = new Response(variant.body, variant)
        response.headers.set("cache-control", "public, max-age=31536000, immutable")
        response.headers.set("content-type", "image/webp")
        response.headers.set("access-control-allow-origin", "*")
        response.headers.set("x-resize", "snippet")
        return response
      }
    }
    return fetch(request)
  },
}
