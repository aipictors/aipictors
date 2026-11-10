/**
 * 投稿済みの作品の編集ページか。ここでは画面にファイルを落としても新規投稿へ移らない
 */
export const isPostEditPath = (pathname: string): boolean =>
  /^\/(?:(?:en|r)\/){0,2}posts\/[^/]+\/(?:image|animation|text)\/edit(?:\/|$)/.test(
    pathname,
  )
