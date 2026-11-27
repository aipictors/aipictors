import { RemixBrowser } from "@remix-run/react"
import { StrictMode, startTransition } from "react"
import { hydrateRoot } from "react-dom/client"
import { removeEdgeInjectedHeadTags } from "~/utils/edge-injected-head-tags"

// Cloudflare が配信時に <head> へ足すタグは React の描画に無いので、hydration の前に外す
// （残すと <head> の突き合わせが失敗し、ページ全体をブラウザで描き直していた）
removeEdgeInjectedHeadTags(document)

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <RemixBrowser />
    </StrictMode>,
  )
})
