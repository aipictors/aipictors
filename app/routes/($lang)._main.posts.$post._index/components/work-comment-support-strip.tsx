import { useEffect, useState } from "react"
import { SupportTierChip } from "~/components/support-super-chat"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import { getSupportTier, pickPinnedSupports } from "~/utils/support-tier"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"

type StripComment = {
  id: string
  createdAt: number
  text?: string | null
  support?: {
    freeCoinAmount: number
    premiumCoinAmount: number
    totalPt: number
  } | null
  user?: { name?: string | null; iconUrl?: string | null } | null
}

/**
 * コメント欄の上の「応援の帯」。最近の推し付きコメントを段階の時間だけ上に出す（スーパーチャットのピン留め）
 * 読み込んだコメントだけで決める。時刻はブラウザで決める（サーバーの描画と食い違わないよう、描画後に出す）
 */
export function WorkCommentSupportStrip(props: { comments: StripComment[] }) {
  const t = useTranslation()
  const [nowSeconds, setNowSeconds] = useState<number | null>(null)

  useEffect(() => {
    setNowSeconds(Math.floor(Date.now() / 1000))
  }, [])

  if (nowSeconds === null) return null
  const pinned = pickPinnedSupports(props.comments, nowSeconds)
  if (pinned.length === 0) return null

  return (
    <section
      aria-label={t("最近の推し", "Recent support")}
      className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]"
    >
      {pinned.map((comment) => {
        if (!comment.support) return null
        const tier = getSupportTier(comment.support.totalPt)
        return (
          <a
            key={comment.id}
            href={`#comment-${comment.id}`}
            onClick={(event) => {
              const target = document.getElementById(`comment-${comment.id}`)
              if (!target) return
              event.preventDefault()
              target.scrollIntoView({
                behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
                  .matches
                  ? "auto"
                  : "smooth",
                block: "center",
              })
            }}
            className={cn(
              "flex max-w-60 shrink-0 items-center gap-2 rounded-full py-1 pr-1 pl-1 ring-1",
              tier?.bodyClassName,
            )}
          >
            <img
              src={withIconUrlFallback(comment.user?.iconUrl)}
              alt=""
              className="size-7 shrink-0 rounded-full object-cover"
              loading="lazy"
            />
            <span className="min-w-0 truncate font-medium text-xs">
              {comment.user?.name ?? ""}
            </span>
            <SupportTierChip support={comment.support} className="shrink-0" />
          </a>
        )
      })}
    </section>
  )
}
