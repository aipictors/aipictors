import { useState } from "react"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"

type Props = {
  /** [日本語, English] のセリフ */
  lines: readonly (readonly [string, string])[]
  /** 最初に出すセリフを決める数（サーバーとブラウザで同じになるように loader から渡す） */
  seed?: number
  className?: string
}

const PICTOR_CHAN_ICON_URL = "https://assets.aipictors.com/pictorchanicon.webp"

/**
 * ぴくたーちゃんの一言（アイコンを押すと次のセリフに変わる）
 * 高さは 1〜2 行分で、スマホでも一覧を押し下げすぎない
 */
export function PictorChanHint(props: Props) {
  const t = useTranslation()
  const [count, setCount] = useState(0)

  const line = props.lines[((props.seed ?? 0) + count) % props.lines.length]

  if (line === undefined) {
    return null
  }

  return (
    <div className={cn("flex items-center gap-2", props.className)}>
      <button
        type="button"
        onClick={() => setCount((current) => current + 1)}
        aria-label={t("ぴくたーちゃんの別の一言を聞く", "Ask Pictor-chan again")}
        className="hover:-rotate-6 size-10 shrink-0 rounded-full transition-transform active:scale-90 motion-reduce:transition-none"
      >
        <img
          src={PICTOR_CHAN_ICON_URL}
          alt=""
          width={40}
          height={40}
          decoding="async"
          className="size-10 rounded-full"
        />
      </button>
      <p
        aria-live="polite"
        className="relative min-w-0 rounded-2xl rounded-tl-sm bg-muted px-3 py-1.5 text-muted-foreground text-xs leading-relaxed md:text-sm"
      >
        {t(line[0], line[1])}
      </p>
    </div>
  )
}
