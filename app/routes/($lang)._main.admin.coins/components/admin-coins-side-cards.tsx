import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { Separator } from "~/components/ui/separator"
import type { AdminCoinsPageState } from "~/routes/($lang)._main.admin.coins/hooks/use-admin-coins-page"
import {
  formatDelta,
  formatTargetScope,
  jstDateTimeFormatter,
} from "~/routes/($lang)._main.admin.coins/utils/admin-coins-utils"

/**
 * 操作ガイド、直近の実行結果、操作履歴
 */
export function AdminCoinsSideCards(
  props: Pick<
    AdminCoinsPageState,
    "histories" | "historyCount" | "historyLoading" | "lastResult"
  >,
) {
  const { histories, historyCount, historyLoading, lastResult } = props

  return (
    <div className="space-y-6">
      <Card className="rounded-[28px] border-white/10 bg-white/5 text-slate-100 shadow-none">
        <CardHeader>
          <CardTitle className="text-lg">操作ガイド</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-300">
          <p>
            対象範囲は全ユーザ、プラン別、またはユーザID指定で選択できます。
          </p>
          <p>
            減少時は各ユーザの保有量を上限に減算され、残高が負になることはありません。
          </p>
          <p>
            付与・減少の結果はコイン履歴、通知、管理画面の操作履歴に残ります。
          </p>
        </CardContent>
      </Card>

      <Card className="rounded-[28px] border-white/10 bg-white/5 text-slate-100 shadow-none">
        <CardHeader>
          <CardTitle className="text-lg">直近の実行結果</CardTitle>
        </CardHeader>
        <CardContent>
          {lastResult ? (
            <div className="space-y-3 text-sm text-slate-300">
              <div className="flex items-center justify-between">
                <span>対象ユーザ数</span>
                <span className="font-semibold text-white">
                  {lastResult.targetCount}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>変更が入ったユーザ数</span>
                <span className="font-semibold text-white">
                  {lastResult.changedCount}
                </span>
              </div>
              <Separator className="bg-white/10" />
              <div className="flex items-center justify-between">
                <span>付与フリーコイン合計</span>
                <span className="font-semibold text-white">
                  {lastResult.freeGrantedTotal}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>付与プレミアムコイン合計</span>
                <span className="font-semibold text-white">
                  {lastResult.premiumGrantedTotal}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>減少フリーコイン合計</span>
                <span className="font-semibold text-white">
                  {lastResult.freeReducedTotal}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>減少プレミアムコイン合計</span>
                <span className="font-semibold text-white">
                  {lastResult.premiumReducedTotal}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400">まだ実行結果はありません。</p>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-[28px] border-white/10 bg-white/5 text-slate-100 shadow-none">
        <CardHeader>
          <CardTitle className="text-lg">操作履歴</CardTitle>
          <CardDescription className="text-slate-400">
            最新20件を表示しています。全 {historyCount} 件
          </CardDescription>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <p className="text-sm text-slate-400">読み込み中...</p>
          ) : histories.length === 0 ? (
            <p className="text-sm text-slate-400">まだ履歴はありません。</p>
          ) : (
            <div className="space-y-4">
              {histories.map((history) => (
                <div
                  key={history.id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-white">
                        {formatTargetScope(
                          history.targetScope,
                          history.planType,
                        )}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {jstDateTimeFormatter.format(
                          new Date(history.createdAt * 1000),
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-white">
                        {history.freeDelta > 0 || history.premiumDelta > 0
                          ? "付与"
                          : "減少"}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        実行者 ID: {history.moderatorUserId}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 space-y-2 text-xs text-slate-300">
                    <p>
                      要求値:{" "}
                      {formatDelta(history.freeDelta, history.premiumDelta)}
                    </p>
                    <p>
                      対象 {history.targetCount} 件 / 変更{" "}
                      {history.changedCount} 件
                    </p>
                    {(history.freeGrantedTotal > 0 ||
                      history.premiumGrantedTotal > 0) && (
                      <p>
                        実付与: フリー {history.freeGrantedTotal} / プレミアム{" "}
                        {history.premiumGrantedTotal}
                      </p>
                    )}
                    {(history.freeReducedTotal > 0 ||
                      history.premiumReducedTotal > 0) && (
                      <p>
                        実減少: フリー {history.freeReducedTotal} / プレミアム{" "}
                        {history.premiumReducedTotal}
                      </p>
                    )}
                    {history.expiresAt && (
                      <p>
                        失効日時:{" "}
                        {jstDateTimeFormatter.format(
                          new Date(history.expiresAt * 1000),
                        )}
                      </p>
                    )}
                    {history.targetScope === "USER_IDS" &&
                      history.targetUserIds.length > 0 && (
                        <p className="break-all">
                          対象ID: {history.targetUserIds.join(", ")}
                        </p>
                      )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
