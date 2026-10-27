import { SparklesIcon } from "lucide-react"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  /** サーバーが受け付け済みか */
  isSent: boolean
}

const RAINBOW =
  "conic-gradient(from 0deg, #ff6b9d, #ffb86b, #ffe66b, #6bffb8, #6bd5ff, #9d8bff, #ff6bd5, #ff6b9d)"

/**
 * 生成ボタンを押した直後、一覧に本物のカードが出るまでの仮カード
 */
export function PendingGenerationCard(props: Props) {
  const t = useTranslation()

  return (
    <div className="relative h-full min-h-[160px] overflow-hidden rounded-xl p-[2px]">
      <div
        aria-hidden
        className="-inset-[60%] absolute animate-[spin_3.5s_linear_infinite]"
        style={{ background: RAINBOW }}
      />
      <div className="relative flex h-full flex-col overflow-hidden rounded-[10px] bg-background">
        <div
          aria-hidden
          className="-inset-1/2 absolute animate-[spin_9s_linear_infinite] opacity-40 blur-2xl"
          style={{ background: RAINBOW }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/20" />
        <div className="relative p-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-black/45 px-2 py-0.5 font-semibold text-[11px] text-white backdrop-blur-sm">
            <SparklesIcon className="size-3" />
            {t("新しい生成", "New")}
          </span>
        </div>
        <div className="relative mt-auto space-y-1.5 p-2.5">
          <p className="animate-pulse font-bold text-sm text-white drop-shadow">
            {props.isSent
              ? t("受け付けました", "Accepted")
              : t("送信中…", "Sending…")}
          </p>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/25">
            <div className="h-full w-1/3 animate-pulse rounded-full bg-white/60" />
          </div>
        </div>
      </div>
    </div>
  )
}
