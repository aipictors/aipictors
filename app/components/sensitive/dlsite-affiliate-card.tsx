import { ExternalLinkIcon } from "lucide-react"
import { useEffect } from "react"
import { useTranslation } from "~/hooks/use-translation"
import {
  pickDlsiteSearchTags,
  toDlsiteAiRankingUrl,
  toDlsiteAiSearchUrl,
} from "~/utils/dlsite-affiliate"
import { trackGrowthEvent } from "~/utils/track-growth-event"

type Props = {
  tags: string[]
  /** 表示・クリックの集計で枠を見分ける */
  source: string
}

/**
 * R18 作品ページの DLsite アフィリエイト枠（作品のタグで AI 生成作品を探す）
 * 有料会員には出さない（呼び出し側で判定する）
 */
export function DlsiteAffiliateCard(props: Props) {
  const t = useTranslation()
  const tags = pickDlsiteSearchTags(props.tags)

  useEffect(() => {
    trackGrowthEvent("dlsite_view", props.source)
  }, [props.source])

  const onClick = () => trackGrowthEvent("dlsite_click", props.source)

  return (
    <div className="w-full space-y-3 rounded-md border p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="font-bold text-sm">
          {t("DLsite で似た作品を探す", "Find similar works on DLsite")}
        </p>
        <span className="rounded border px-1 text-muted-foreground text-xs">
          PR
        </span>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <a
              key={tag}
              href={toDlsiteAiSearchUrl(tag)}
              target="_blank"
              rel="noopener sponsored"
              onClick={onClick}
              className="rounded-full border px-3 py-1 text-sm hover:bg-accent"
            >
              #{tag}
            </a>
          ))}
        </div>
      )}
      <a
        href={toDlsiteAiRankingUrl()}
        target="_blank"
        rel="noopener sponsored"
        onClick={onClick}
        className="flex items-center gap-1 text-sm underline-offset-2 hover:underline"
      >
        {t("AI生成作品の週間ランキング", "Weekly AI-generated ranking")}
        <ExternalLinkIcon className="h-3 w-3" />
      </a>
    </div>
  )
}
