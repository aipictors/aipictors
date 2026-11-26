import { BadgeCheck, History } from "lucide-react"
import { useState } from "react"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { useToast } from "~/hooks/use-toast"
import {
  fetchWorkOriginalJudgmentLogs,
  setWorkOriginalJudgment,
  type WorkOriginalJudgment,
  type WorkOriginalJudgmentDetail,
  type WorkOriginalJudgmentLog,
} from "~/lib/work-original-judgment"

const toJudgmentText = (judgment: WorkOriginalJudgment | null) =>
  judgment === "ORIGINAL"
    ? "オリジナル"
    : judgment === "FAN_WORK"
      ? "二次創作"
      : "未判定"

const toTimeText = (seconds: number) =>
  new Date(seconds * 1000).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })

/**
 * 作品がオリジナルか二次創作かの運営の判定（作品のタグとは別）。
 * オリジナルにすると作品ページに「オリジナル（運営確認）」のバッジが出て、作品への推しでプレミアムコインが使える。
 * 二次創作にするとタグにかかわらずプレミアムコインは使えない。未判定は今までどおりタグで見る
 */
export function AdminWorkOriginalJudgmentPanel(props: {
  workId: string
  /** undefined は読み込み中、null は未判定 */
  judgment: WorkOriginalJudgmentDetail | null | undefined
  onChange: (judgment: WorkOriginalJudgmentDetail | null) => void
}) {
  const { toast } = useToast()
  const [note, setNote] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [logs, setLogs] = useState<WorkOriginalJudgmentLog[] | null>(null)

  const current = props.judgment?.judgment ?? null

  const loadLogs = async () => {
    try {
      setLogs(await fetchWorkOriginalJudgmentLogs(props.workId))
    } catch (error) {
      toast({
        title: "判定の記録を読めませんでした",
        description: error instanceof Error ? error.message : undefined,
      })
    }
  }

  const save = async (judgment: WorkOriginalJudgment | null) => {
    setIsSaving(true)
    try {
      const result = await setWorkOriginalJudgment({
        workId: props.workId,
        judgment,
        note: note.trim() || null,
      })
      props.onChange(result)
      setNote("")
      toast({ title: `判定を「${toJudgmentText(judgment)}」にしました` })
      if (logs !== null) await loadLogs()
    } catch (error) {
      toast({
        title: "判定を保存できませんでした",
        description: error instanceof Error ? error.message : undefined,
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-2 rounded-2xl border border-white/10 bg-black/20 p-3 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-slate-400">オリジナル判定</span>
        {props.judgment === undefined ? (
          <span className="text-slate-500">読み込み中...</span>
        ) : (
          <Badge
            variant={current === "ORIGINAL" ? "default" : "outline"}
            className={
              current === "FAN_WORK"
                ? "border-amber-400/30 bg-amber-500/10 text-amber-100"
                : current === null
                  ? "border-white/20 text-slate-300"
                  : "flex items-center gap-1"
            }
          >
            {current === "ORIGINAL" && <BadgeCheck className="size-3" />}
            {toJudgmentText(current)}
          </Badge>
        )}
        {props.judgment && (
          <span className="text-slate-500 text-xs">
            {toTimeText(props.judgment.judgedAt)}（ユーザー #
            {props.judgment.judgedBy}）
            {props.judgment.note ? ` ${props.judgment.note}` : ""}
          </span>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="メモ（任意。判定の理由など）"
          maxLength={500}
          className="h-8 max-w-xs border-white/10 bg-white/5 text-slate-100"
        />
        <Button
          size="sm"
          disabled={isSaving || current === "ORIGINAL"}
          onClick={() => save("ORIGINAL")}
        >
          オリジナル
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
          disabled={isSaving || current === "FAN_WORK"}
          onClick={() => save("FAN_WORK")}
        >
          二次創作
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="text-slate-300 hover:bg-white/10"
          disabled={isSaving || current === null}
          onClick={() => save(null)}
        >
          判定を外す
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="text-slate-300 hover:bg-white/10"
          onClick={() => (logs === null ? loadLogs() : setLogs(null))}
        >
          <History className="mr-1 size-4" />
          {logs === null ? "記録" : "記録を閉じる"}
        </Button>
      </div>
      {logs !== null && (
        <ul className="space-y-1 text-slate-400 text-xs">
          {logs.length === 0 && <li>記録はまだありません</li>}
          {logs.map((log, index) => (
            <li key={`${log.judgedAt}-${index}`}>
              {toTimeText(log.judgedAt)} {toJudgmentText(log.judgment)}
              {log.judgment === null ? "に戻す" : ""}（ユーザー #{log.judgedBy}
              ）{log.note ? ` ${log.note}` : ""}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
