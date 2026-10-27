import { useEffect, useState } from "react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"

type ServerStatus = {
  total: number
  working: number
  normalWaiting: number | null
  priorityWaiting: number | null
  checkedAt: string
}

/** 取り直す間隔（API 側は 20 秒キャッシュ） */
const REFRESH_INTERVAL_MS = 30_000

type Level = "stopped" | "partial" | "busy" | "normal" | "free"

/**
 * 混み具合の判定（1 台あたりの待ち件数で見る）
 */
function toLevel(status: ServerStatus): Level {
  if (status.working === 0) return "stopped"
  if (status.working < status.total) return "partial"
  const waitingPerServer = (status.normalWaiting ?? 0) / status.working
  if (waitingPerServer >= 15) return "busy"
  if (waitingPerServer >= 5) return "normal"
  return "free"
}

const dotClassNames: Record<Level, string> = {
  stopped: "bg-red-500",
  partial: "bg-amber-500",
  busy: "bg-orange-500",
  normal: "bg-yellow-400",
  free: "bg-emerald-500",
}

/**
 * 生成サーバーの稼働状況・混み具合（タップで詳しく）
 */
export function GenerationServerStatusBadge(props: { className?: string }) {
  const t = useTranslation()

  const [status, setStatus] = useState<ServerStatus | null>(null)

  useEffect(() => {
    let isCancelled = false
    const load = async () => {
      if (document.visibilityState === "hidden") return
      try {
        const response = await fetch("/api/generation/status")
        if (!response.ok) return
        const body = (await response.json()) as { data: ServerStatus | null }
        if (!isCancelled && body.data) setStatus(body.data)
      } catch {
        // 取れなければ前回の表示のまま
      }
    }
    load()
    const intervalId = setInterval(load, REFRESH_INTERVAL_MS)
    document.addEventListener("visibilitychange", load)
    return () => {
      isCancelled = true
      clearInterval(intervalId)
      document.removeEventListener("visibilitychange", load)
    }
  }, [])

  if (status === null) return null

  const level = toLevel(status)

  const label = {
    stopped: t("生成停止中", "Generation stopped"),
    partial: t("一部停止中", "Partly down"),
    busy: t("混雑", "Busy"),
    normal: t("やや混雑", "Moderate"),
    free: t("空いています", "Not busy"),
  }[level]

  const checkedTime = new Date(status.checkedAt).toLocaleTimeString("ja-JP", {
    timeZone: "Asia/Tokyo",
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex shrink-0 items-center gap-1.5 rounded-full border border-border/60 bg-background/95 px-3 py-2 font-medium text-[11px] text-foreground/80 leading-none shadow-sm",
            props.className,
          )}
          aria-label={t("生成サーバーの状況", "Generation server status")}
        >
          <span
            className={cn("size-2 shrink-0 rounded-full", dotClassNames[level])}
          />
          {label}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 space-y-2 text-sm">
        <p className="font-semibold">
          {t("生成サーバーの状況", "Generation server status")}
        </p>
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
          <dt className="text-muted-foreground">
            {t("稼働中のサーバー", "Servers running")}
          </dt>
          <dd>
            {status.working} / {status.total}
            {t("台", "")}
          </dd>
          {status.normalWaiting !== null && (
            <>
              <dt className="text-muted-foreground">
                {t("順番待ち（通常）", "Waiting (normal)")}
              </dt>
              <dd>
                {status.normalWaiting}
                {t("件", "")}
              </dd>
            </>
          )}
          {status.priorityWaiting !== null && (
            <>
              <dt className="text-muted-foreground">
                {t("順番待ち（優先）", "Waiting (priority)")}
              </dt>
              <dd>
                {status.priorityWaiting}
                {t("件", "")}
              </dd>
            </>
          )}
        </dl>
        {status.working < status.total && (
          <p className="text-muted-foreground text-xs leading-5">
            {t(
              "一部のサーバーが再起動中か調整中のため、いつもより時間がかかることがあります。",
              "Some servers are restarting or under maintenance, so generation may take longer than usual.",
            )}
          </p>
        )}
        <p className="text-muted-foreground text-xs">
          {t(`${checkedTime} 時点・30秒ごとに更新`, `As of ${checkedTime}, updated every 30s`)}
        </p>
      </PopoverContent>
    </Popover>
  )
}
