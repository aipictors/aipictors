// @ts-ignore - `wrangler pages functions build` が書き出す
import pages from "./build/worker/index.js"
import { missingFileCacheControl } from "./app/utils/missing-file-cache-control"
import { handleEmbedRequest } from "./app/lib/work-embed"

type Env = {
  INTERNAL_PURGE_TOKEN?: string
  VITE_GRAPHQL_ENDPOINT_REMIX?: string
  VITE_GRAPHQL_ENDPOINT?: string
}

type CacheContext = ExecutionContext & {
  cache?: { purge(options: { tags: string[] }): Promise<unknown> }
}

/**
 * 作品の編集・削除のあと、その作品ページのキャッシュを消す（API の Worker から呼ぶ）
 */
const purgeWorkPages = async (
  request: Request,
  env: Env,
  ctx: CacheContext,
) => {
  if (
    !env.INTERNAL_PURGE_TOKEN ||
    request.headers.get("authorization") !==
      `Bearer ${env.INTERNAL_PURGE_TOKEN}`
  ) {
    return new Response("Forbidden", { status: 403 })
  }
  const { workIds } = (await request.json()) as { workIds: number[] }
  await ctx.cache?.purge({ tags: workIds.map((id) => `work-${Number(id)}`) })
  return new Response(null, { status: 204 })
}

/** サーバーの設定ファイルなどを探しに来る自動の探索（.env・.php・.git・WordPress の管理画面など） */
const PROBE_PATH =
  /(?:\/\.(?:env|git|aws|ssh|svn|hg|htaccess|htpasswd|DS_Store)|\.(?:php\d?|aspx?|jsp|cgi|sql|bak|old|orig|save|swp|ini|ya?ml|log|zip|tar|gz|rar|7z)(?:$|\/)|^\/(?:en\/)?(?:wp-(?!content\/themes\/AISite\/favicons\/)|xmlrpc|cgi-bin\/|phpmyadmin|vendor\/))/i

/** 画像・スクリプトなどのファイル。あるものは Worker より前に静的ファイルとして返るので、ここまで来たものは無い */
const MISSING_FILE_PATH =
  /\.(?:png|jpe?g|gif|ico|svg|webp|avif|css|m?js|map|woff2?|ttf|otf|mp4|webm|mp3|wasm)$/i

/** 前のサイトのころのアイコン（ホーム画面に置いたままの端末が取りに来る） */
const OLD_FAVICON_PATH = /^\/(?:en\/)?wp-content\/themes\/AISite\/favicons\//

/**
 * 無いファイルと自動の探索には、アプリ本体を読み込まずに返す。
 * これまでは 1 件ごとに 404 のページを組み立てていて、1 回 0.1〜0.7 秒の CPU を使っていた（1 日 約 3 万件）
 */
const answerWithoutApp = (request: Request): Response | null => {
  if (request.method !== "GET" && request.method !== "HEAD") return null
  const { pathname } = new URL(request.url)
  // タグ・ユーザー名・検索の言葉には、どんな文字でも入る（「.php」で終わるタグなど）
  if (/^\/(?:en\/)?(?:r\/)?(?:tags|users|search)\//.test(pathname)) return null
  if (OLD_FAVICON_PATH.test(pathname)) {
    return new Response(null, {
      status: 301,
      headers: {
        Location: "/icon.png",
        "Cache-Control": "public, max-age=86400",
      },
    })
  }
  if (
    PROBE_PATH.test(pathname) ||
    (MISSING_FILE_PATH.test(pathname) && !/^\/(?:_w|api|__)/.test(pathname))
  ) {
    return new Response("Not Found", {
      status: 404,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": missingFileCacheControl(pathname),
      },
    })
  }
  return null
}

/** Firebase のログイン画面（/__/auth/*）を置いている Firebase Hosting */
const FIREBASE_AUTH_ORIGIN = "https://kwkjsui8ghyt93ai5feb.firebaseapp.com"

/**
 * Google・X ログインの画面をこのサイトのドメインで中継する。
 * firebaseapp.com のままだと別サイト扱いになり、iPhone の Safari・Chrome などは保存領域を切り離すため
 * 「missing initial state」でログインできなかった。authDomain をこのサイトにして同じドメインで動かす
 */
const proxyFirebaseAuth = (request: Request): Promise<Response> | null => {
  const url = new URL(request.url)
  if (!url.pathname.startsWith("/__/auth/")) return null
  return fetch(
    new Request(`${FIREBASE_AUTH_ORIGIN}${url.pathname}${url.search}`, request),
  )
}

export default {
  async fetch(request: Request, env: Env, ctx: CacheContext) {
    const auth = proxyFirebaseAuth(request)
    if (auth) return auth
    const quick = answerWithoutApp(request)
    if (quick) return quick
    if (
      request.method === "POST" &&
      new URL(request.url).pathname === "/__internal/purge-work"
    ) {
      return purgeWorkPages(request, env, ctx)
    }
    // 案内の表示・クリックの計測（/api/growth-event）は Cloudflare のアクセス集計で数えるだけなので、
    // アプリ本体を読み込まずにここで返す（月 100 万回以上あり、1 回 13ms ほど CPU を使っていた）
    if (
      request.method === "GET" &&
      new URL(request.url).pathname === "/api/growth-event"
    ) {
      return new Response(null, {
        status: 204,
        headers: { "Cache-Control": "no-store" },
      })
    }
    // 作品の埋め込みと oEmbed は、アプリ本体を読み込まずに返す（app/lib/work-embed.ts）
    const embed = await handleEmbedRequest(request, env)
    if (embed) return embed
    const response: Response = await pages.fetch(request, env, ctx)
    // Workers のキャッシュは Cache-Control がないと推定で保存するので、明示したものだけを保存させる
    if (response.headers.has("Cache-Control") || response.status === 101) {
      return response
    }
    const uncached = new Response(response.body, response)
    uncached.headers.set("Cache-Control", "private, no-store")
    return uncached
  },
}
