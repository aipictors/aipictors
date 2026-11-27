/**
 * Cloudflare の「Search for Agents」が配信時に <head> へ足す meta（agent:instructions・agent:endpoint など）。
 * HTML には残るので、AI エージェント・クローラーからは見える
 */
const EDGE_INJECTED_HEAD_TAG_SELECTOR = 'head > meta[name^="agent:"]'

/**
 * React の描画に無いタグを hydration の前に外す。
 * <head> も React が突き合わせるので、知らないタグがあると hydration が失敗し、ページ全体を描き直していた
 */
export function removeEdgeInjectedHeadTags(
  doc: Pick<Document, "querySelectorAll">,
): number {
  const tags = doc.querySelectorAll(EDGE_INJECTED_HEAD_TAG_SELECTOR)
  for (const tag of tags) tag.remove()
  return tags.length
}
