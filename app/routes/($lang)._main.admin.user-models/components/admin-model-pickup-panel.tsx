import { useQuery, useQueryClient } from "@tanstack/react-query"
import { CopyIcon, CrownIcon, RefreshCwIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Textarea } from "~/components/ui/textarea"
import { userModelPickupQueryKey } from "~/components/user-models/user-model-pickup-banner"
import { Link } from "~/lib/app/locale-router"
import {
  fetchUserModelPickupAdmin,
  updateUserModelPickup,
} from "~/lib/user-models/client"
import type { UserModelPickupAdminEntry } from "~/lib/user-models/types"

const addDays = (ymd: string, days: number) => {
  const d = new Date(`${ymd}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

const cardClass =
  "rounded-[28px] border-white/10 bg-white/5 text-slate-100 shadow-none"

/**
 * 週替わりのピックアップモデルの管理（今週・来週の差し替え、候補の点数、X 投稿の下書き）
 */
export function AdminModelPickupPanel() {
  const queryClient = useQueryClient()
  const [week, setWeek] = useState<"current" | "next">("current")
  const [pending, setPending] = useState<string | null>(null)

  const base = useQuery({
    queryKey: ["admin", "user-model-pickups", "current"],
    queryFn: () => fetchUserModelPickupAdmin(null),
  })
  const currentWeekStart = base.data?.currentWeekStart ?? null
  const weekStart =
    currentWeekStart === null
      ? null
      : week === "current"
        ? currentWeekStart
        : addDays(currentWeekStart, 7)

  const selected = useQuery({
    queryKey: ["admin", "user-model-pickups", weekStart],
    enabled: weekStart !== null && week === "next",
    queryFn: () => fetchUserModelPickupAdmin(weekStart),
  })
  const data = week === "current" ? base.data : selected.data

  const entry: UserModelPickupAdminEntry | null =
    data?.pickups.find((pickup) => pickup.weekStart === weekStart) ?? null

  const decide = async (modelId: string | null) => {
    if (weekStart === null) return
    const label = modelId === null ? "自動で選び直し" : "差し替え"
    if (!window.confirm(`${weekStart} の週を${label}ます。登録者にお知らせが届きます。よろしいですか？`)) {
      return
    }
    setPending(modelId ?? "auto")
    try {
      await updateUserModelPickup({ weekStart, modelId })
      toast.success("ピックアップを更新しました")
      await queryClient.invalidateQueries({
        queryKey: ["admin", "user-model-pickups"],
      })
      await queryClient.invalidateQueries({ queryKey: userModelPickupQueryKey })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "更新に失敗しました")
    } finally {
      setPending(null)
    }
  }

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text)
    toast.success("コピーしました")
  }

  return (
    <Card className={cardClass}>
      <CardHeader className="space-y-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <CrownIcon className="size-4 text-amber-300" />
          週替わりのピックアップモデル
        </CardTitle>
        <p className="text-slate-400 text-xs leading-relaxed">
          毎週月曜 00:00（JST）に直近 7 日の利用（使った人数・回数）・新しさ・LoRA／自作アップロード・作例から自動で選びます。
          R18・サムネイルなし・他サービスでの利用を許していないライセンス・直近 8 週に選んだモデル・直近 4 週に選んだ登録者は除外。
          差し替えた週は自動選定で上書きしません。選ぶとその週のお題（ランキングつき）が作られ、登録者にお知らせが届きます。
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={week === "current" ? "default" : "outline"}
            onClick={() => setWeek("current")}
          >
            今週{currentWeekStart ? `（${currentWeekStart}〜）` : ""}
          </Button>
          <Button
            size="sm"
            variant={week === "next" ? "default" : "outline"}
            onClick={() => setWeek("next")}
          >
            来週{currentWeekStart ? `（${addDays(currentWeekStart, 7)}〜）` : ""}
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={pending !== null || weekStart === null}
            onClick={() => decide(null)}
          >
            <RefreshCwIcon className="mr-1 size-3.5" />
            自動で選び直す
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {base.isLoading || (week === "next" && selected.isLoading) ? (
          <p className="text-slate-400 text-sm">読み込み中...</p>
        ) : base.error ? (
          <p className="text-rose-200 text-sm">
            {base.error instanceof Error ? base.error.message : "取得に失敗しました"}
          </p>
        ) : (
          <>
            {entry ? (
              <div className="flex flex-col gap-4 md:flex-row">
                {entry.model?.thumbnailUrl && (
                  <img
                    src={entry.model.thumbnailUrl}
                    alt=""
                    className="aspect-[3/4] w-28 shrink-0 rounded-xl object-cover"
                  />
                )}
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">
                      {entry.source === "ADMIN" ? "運営が選択" : "自動"}
                    </Badge>
                    {entry.score !== null && (
                      <span className="text-slate-400 text-xs">点数 {entry.score}</span>
                    )}
                  </div>
                  <p className="font-semibold">
                    {entry.model ? (
                      <Link to={`/models/u/${entry.modelId}`} className="hover:underline">
                        {entry.model.name}
                      </Link>
                    ) : (
                      `${entry.modelId}（使えなくなっています）`
                    )}
                  </p>
                  {entry.eventSlug && (
                    <p className="text-slate-300 text-xs">
                      お題:{" "}
                      <Link to={`/events/${entry.eventSlug}`} className="underline">
                        /events/{entry.eventSlug}
                      </Link>
                      （タグ {entry.eventTag}）
                    </p>
                  )}
                  {entry.xDraft && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-xs">X 投稿の下書き（投稿はしていません）</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copy(entry.xDraft?.text ?? "")}
                        >
                          <CopyIcon className="mr-1 size-3.5" />
                          文面をコピー
                        </Button>
                      </div>
                      <Textarea
                        readOnly
                        value={entry.xDraft.text}
                        className="min-h-48 border-white/10 bg-black/20 text-slate-100 text-xs"
                      />
                      {entry.xDraft.images.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-slate-400 text-xs">添付する画像（クリックで開いて保存）</span>
                          <div className="flex gap-2">
                            {entry.xDraft.images.map((url) => (
                              <a key={url} href={url} target="_blank" rel="noreferrer">
                                <img src={url} alt="" className="h-24 rounded-lg object-cover" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-slate-400 text-sm">
                {week === "current"
                  ? "今週のピックアップはまだ決まっていません（月曜 00:00 に自動で決まります）。"
                  : "来週の分はまだありません。下の候補から先に選んでおけます（選ばなければ月曜に自動で決まります）。"}
              </p>
            )}

            <div className="space-y-2">
              <p className="text-slate-400 text-xs">
                候補（直近 7 日の利用で計算。上ほど点数が高い）
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-slate-400">
                    <tr>
                      <th className="py-1 pr-2">モデル</th>
                      <th className="py-1 pr-2">点数</th>
                      <th className="py-1 pr-2">7日の人数</th>
                      <th className="py-1 pr-2">7日の回数</th>
                      <th className="py-1 pr-2">種類</th>
                      <th className="py-1 pr-2">除外理由</th>
                      <th className="py-1" />
                    </tr>
                  </thead>
                  <tbody>
                    {(data?.candidates ?? []).map((candidate) => (
                      <tr key={candidate.modelId} className="border-white/5 border-t">
                        <td className="max-w-56 truncate py-1.5 pr-2">
                          <Link to={`/models/u/${candidate.modelId}`} className="hover:underline">
                            {candidate.name}
                          </Link>
                        </td>
                        <td className="py-1.5 pr-2">{candidate.score}</td>
                        <td className="py-1.5 pr-2">{candidate.stats.users}</td>
                        <td className="py-1.5 pr-2">{candidate.stats.generations}</td>
                        <td className="py-1.5 pr-2">
                          {candidate.stats.kind === "LORA" ? "LoRA" : "CP"}
                          {candidate.stats.uploaded ? "" : "・取込"}
                        </td>
                        <td className="py-1.5 pr-2 text-slate-400">
                          {candidate.excludedReason ?? "-"}
                        </td>
                        <td className="py-1.5 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={pending !== null || entry?.modelId === candidate.modelId}
                            onClick={() => decide(candidate.modelId)}
                          >
                            {entry?.modelId === candidate.modelId ? "選択中" : "これにする"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {(base.data?.pickups.length ?? 0) > 0 && (
              <div className="space-y-1">
                <p className="text-slate-400 text-xs">これまでのピックアップ</p>
                <ul className="space-y-0.5 text-xs">
                  {base.data?.pickups.map((pickup) => (
                    <li key={pickup.weekStart} className="flex gap-2">
                      <span className="text-slate-400">{pickup.weekStart}</span>
                      <span className="truncate">{pickup.model?.name ?? pickup.modelId}</span>
                      <span className="text-slate-500">
                        {pickup.source === "ADMIN" ? "運営" : "自動"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
