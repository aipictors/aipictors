import { Button } from "~/components/ui/button"
import { Link } from "react-router"
import { RiTwitterXLine } from "@remixicon/react"
import { type HTMLProps, forwardRef } from "react"
import { useTranslation } from "~/hooks/use-translation"

interface XIntentProps extends HTMLProps<HTMLAnchorElement> {
  text?: string
  url?: string
  hashtags?: string[]
  via?: string
  related?: string[]
  in_reply_to?: string
}

export const XIntent = forwardRef<HTMLAnchorElement, XIntentProps>(
  (
    { text, url, hashtags, via, related, in_reply_to, ...intrinsicProps },
    forwardedRef,
  ) => {
    const t = useTranslation()
    const _url = new URL("https://x.com/intent/tweet")

    if (text !== undefined) _url.searchParams.set("text", text)
    if (url !== undefined) _url.searchParams.set("url", url)
    if (hashtags !== undefined)
      _url.searchParams.set("hashtags", hashtags.join(","))
    if (via !== undefined) _url.searchParams.set("via", via)
    if (related !== undefined)
      _url.searchParams.set("related", related.join(","))
    if (in_reply_to !== undefined)
      _url.searchParams.set("in_reply_to", in_reply_to)

    return (
      <Button className="flex items-center gap-2" variant="outline" asChild>
        <Link
          ref={forwardedRef}
          to={_url.toString()}
          target="_blank"
          rel="noopener noreferrer"
          {...intrinsicProps}
        >
          <RiTwitterXLine />
          {t("Xで共有する", "Share on X")}
        </Link>
      </Button>
    )
  },
)
