import { useEffect, useState } from "react"
import {
  getLogs,
  clearLogs,
  type LogEntry,
} from "~/routes/($lang).generation._index/utils/client-diagnostics-logger"
import { Button } from "~/components/ui/button"
import { ScrollArea } from "~/components/ui/scroll-area"
import { useTranslation } from "~/hooks/use-translation"

export function GenerationLogsTab() {
  const t = useTranslation()
  const [logs, setLogs] = useState<LogEntry[]>([])

  useEffect(() => {
    setLogs(getLogs())
    const handler = () => setLogs(getLogs())
    window.addEventListener("generation:logs-updated", handler)
    return () => window.removeEventListener("generation:logs-updated", handler)
  }, [])

  return (
    <div className="flex h-full flex-col gap-2 p-2">
      <div className="flex items-center justify-between">
        <div className="text-muted-foreground text-sm">
          {t("診断ログ", "Diagnostics Logs")}
        </div>
        <Button size="sm" variant="ghost" onClick={() => clearLogs()}>
          {t("クリア", "Clear")}
        </Button>
      </div>
      <ScrollArea className="h-[60vh] rounded border p-2">
        <ul className="space-y-2">
          {logs.length === 0 && (
            <li className="text-muted-foreground text-sm">
              {t("ログはありません", "No logs yet")}
            </li>
          )}
          {logs.map((l) => (
            <li key={l.id} className="rounded bg-muted p-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">
                  {new Date(l.timestamp).toLocaleTimeString()}
                </span>
                <span
                  className={
                    l.level === "error"
                      ? "text-red-600"
                      : l.level === "warn"
                        ? "text-yellow-600"
                        : "text-slate-600"
                  }
                >
                  [{l.level}]
                </span>
                <span className="font-mono">{l.source}</span>
              </div>
              <div className="whitespace-pre-wrap break-all">{l.message}</div>
              {typeof l.details !== "undefined" && (
                <pre className="mt-1 overflow-auto rounded bg-background p-2 text-[10px] leading-snug">
                  {(() => {
                    try {
                      return JSON.stringify(l.details, null, 2)
                    } catch {
                      return String(l.details)
                    }
                  })()}
                </pre>
              )}
            </li>
          ))}
        </ul>
      </ScrollArea>
    </div>
  )
}
