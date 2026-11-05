import { ExternalLinkIcon } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useTranslation } from "~/hooks/use-translation"
import {
  type DlsiteWork,
  pickDlsiteSearchTags,
  toDlsiteAiRankingUrl,
  toDlsiteAiSearchUrl,
  toDlsiteWorkUrl,
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

  const ref = useRef<HTMLDivElement>(null)
  const [works, setWorks] = useState<DlsiteWork[]>([])

  // PC とスマホで同じ枠を CSS で出し分けているので、画面に半分以上出たときだけ 1 回数える
  useEffect(() => {
    const element = ref.current
    if (!element || typeof IntersectionObserver === "undefined") return
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        trackGrowthEvent("dlsite_view", props.source)
        observer.disconnect()
        // 画面に出てから作品を読む（売れ筋 30 件から 4 件を選ぶ）
        fetch("/api/dlsite-works")
          .then(
            (response) => response.json() as Promise<{ works?: DlsiteWork[] }>,
          )
          .then((data) => setWorks(pickRandomWorks(data.works ?? [], 4)))
          .catch(() => {})
      },
      { threshold: 0.5 },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [props.source])

  const onClick = () => trackGrowthEvent("dlsite_click", props.source)

  return (
    <div ref={ref} className="w-full space-y-3 rounded-md border p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="font-bold text-sm">
          {t("DLsite で似た作品を探す", "Find similar works on DLsite")}
        </p>
        <span className="rounded border px-1 text-muted-foreground text-xs">
          PR
        </span>
      </div>
      {works.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {works.map((work) => (
            <a
              key={work.workno}
              href={toDlsiteWorkUrl(work.workno)}
              target="_blank"
              rel="noopener sponsored"
              onClick={onClick}
              className="group space-y-1"
            >
              <img
                src={work.imageUrl}
                alt={work.name}
                width={300}
                height={300}
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer-when-downgrade"
                className="aspect-square w-full rounded object-cover"
              />
              <p className="line-clamp-2 text-xs leading-snug group-hover:underline">
                {work.name}
              </p>
            </a>
          ))}
        </div>
      )}
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

/** 毎回同じ作品にならないように選ぶ */
function pickRandomWorks(works: DlsiteWork[], count: number) {
  const pool = [...works]
  const picked: DlsiteWork[] = []
  while (pool.length > 0 && picked.length < count) {
    picked.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0])
  }
  return picked
}
