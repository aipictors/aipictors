import { Button } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import type { AdminCoinsPageState } from "~/routes/($lang)._main.admin.coins/hooks/use-admin-coins-page"
import { jstDateTimeFormatter } from "~/routes/($lang)._main.admin.coins/utils/admin-coins-utils"

/**
 * Amazon ギフトの交換申請の一覧と承認
 */
export function AdminAmazonExchangeCard(
  props: Pick<
    AdminCoinsPageState,
    | "approvedExchangeRequests"
    | "approvingRequestId"
    | "displayedExchangeRequests"
    | "exchangeStatusFilter"
    | "giftCodeByRequestId"
    | "handleApproveExchangeRequest"
    | "isLoadingExchangeList"
    | "loadExchangeList"
    | "pendingExchangeRequests"
    | "reflectedExchangeRequests"
    | "setExchangeStatusFilter"
    | "setGiftCodeByRequestId"
  >,
) {
  const {
    approvedExchangeRequests,
    approvingRequestId,
    displayedExchangeRequests,
    exchangeStatusFilter,
    giftCodeByRequestId,
    handleApproveExchangeRequest,
    isLoadingExchangeList,
    loadExchangeList,
    pendingExchangeRequests,
    reflectedExchangeRequests,
    setExchangeStatusFilter,
    setGiftCodeByRequestId,
  } = props

  return (
    <Card className="mt-6 rounded-[28px] border-white/10 bg-white/5 text-slate-100 shadow-none">
      <CardHeader>
        <CardTitle className="text-lg">Amazonギフト交換申請</CardTitle>
        <CardDescription className="text-slate-400">
          未承認・承認済み・コード反映済みの申請を管理できます。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant={exchangeStatusFilter === "PENDING" ? "default" : "outline"}
            onClick={() => setExchangeStatusFilter("PENDING")}
            className={
              exchangeStatusFilter === "PENDING"
                ? "bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                : "border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
            }
          >
            未承認 ({pendingExchangeRequests.length})
          </Button>
          <Button
            type="button"
            size="sm"
            variant={
              exchangeStatusFilter === "APPROVED" ? "default" : "outline"
            }
            onClick={() => setExchangeStatusFilter("APPROVED")}
            className={
              exchangeStatusFilter === "APPROVED"
                ? "bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                : "border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
            }
          >
            承認 ({approvedExchangeRequests.length})
          </Button>
          <Button
            type="button"
            size="sm"
            variant={
              exchangeStatusFilter === "REFLECTED" ? "default" : "outline"
            }
            onClick={() => setExchangeStatusFilter("REFLECTED")}
            className={
              exchangeStatusFilter === "REFLECTED"
                ? "bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                : "border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
            }
          >
            コード反映 ({reflectedExchangeRequests.length})
          </Button>

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => void loadExchangeList()}
            disabled={isLoadingExchangeList}
            className="ml-auto border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
          >
            {isLoadingExchangeList ? "更新中..." : "一覧を更新"}
          </Button>
        </div>

        {isLoadingExchangeList ? (
          <p className="text-sm text-slate-400">申請一覧を読み込み中...</p>
        ) : displayedExchangeRequests.length === 0 ? (
          <p className="text-sm text-slate-400">該当する申請はありません。</p>
        ) : (
          <div className="space-y-3">
            {displayedExchangeRequests.map((request) => {
              const isPending = request.status === "PENDING"
              const currentGiftCode = giftCodeByRequestId[request.id] ?? ""

              return (
                <div
                  key={request.id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">
                        ¥{request.amazonPointYen.toLocaleString()} 分 /{" "}
                        {request.coinAmount.toLocaleString()} コイン
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        申請ID: {request.id}
                      </p>
                      <p className="text-xs text-slate-400">
                        ユーザID: {request.userId}
                      </p>
                      <p className="text-xs text-slate-400">
                        申請日時:{" "}
                        {jstDateTimeFormatter.format(
                          new Date(request.appliedAt * 1000),
                        )}
                      </p>
                      {request.approvedAt ? (
                        <p className="text-xs text-slate-400">
                          承認日時:{" "}
                          {jstDateTimeFormatter.format(
                            new Date(request.approvedAt * 1000),
                          )}
                        </p>
                      ) : null}
                    </div>

                    <span
                      className={
                        isPending
                          ? "rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs text-yellow-300"
                          : "rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-300"
                      }
                    >
                      {isPending ? "未承認" : "承認"}
                    </span>
                  </div>

                  {(request.amazonGiftCode?.trim().length ?? 0) > 0 ? (
                    <div className="mt-3 rounded-lg border border-emerald-400/20 bg-emerald-500/10 p-3">
                      <p className="text-xs text-slate-300">反映済みコード</p>
                      <p className="select-all break-all font-mono text-sm text-white">
                        {request.amazonGiftCode}
                      </p>
                    </div>
                  ) : null}

                  {isPending ? (
                    <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                      <Input
                        value={currentGiftCode}
                        onChange={(event) =>
                          setGiftCodeByRequestId((current) => ({
                            ...current,
                            [request.id]: event.target.value,
                          }))
                        }
                        placeholder="Amazonギフトコード"
                        className="border-white/10 bg-white/5 font-mono text-slate-100"
                      />
                      <Button
                        type="button"
                        onClick={() =>
                          void handleApproveExchangeRequest(request.id)
                        }
                        disabled={approvingRequestId === request.id}
                        className="bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                      >
                        {approvingRequestId === request.id
                          ? "反映中..."
                          : "コードを反映して承認"}
                      </Button>
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
