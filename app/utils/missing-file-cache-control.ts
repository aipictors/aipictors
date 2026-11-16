/**
 * 無いファイルへの 404 の Cache-Control。
 * /assets/ のスクリプトは、デプロイの切り替えの途中に古い版が受けると一瞬だけ「無い」になる。
 * その 404 を保存すると新しい版のページが 10 分ほど動かなくなる（設定の画面が真っ白）ので、/assets/ は保存させない
 */
export const missingFileCacheControl = (pathname: string) =>
  pathname.startsWith("/assets/") ? "no-store" : "public, max-age=600"
