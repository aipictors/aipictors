import { useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import {
  ArrowLeftIcon,
  CoinsIcon,
  History,
  Inbox,
  MessageCircle,
} from "lucide-react"
import { useContext, useEffect, useState } from "react"
import { toast } from "sonner"
import { CoinHelpDialog } from "~/components/coin-help-dialog"
import { CoinIcon } from "~/components/coin-icon"
import {
  CreatorRewardBadge,
  CreatorRewardsJoinHint,
} from "~/components/creator-reward-badge"
import { CreatorRewardsNotice } from "~/components/creator-rewards-notice"
import { PremiumCoinIcon } from "~/components/premium-coin-icon"
import {
  SupportSuperChatCard,
  SupportTierChip,
} from "~/components/support-super-chat"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { UserAvatarWithFrame } from "~/components/user/user-avatar-with-frame"
import { AuthContext } from "~/contexts/auth-context"
import {
  findCreatorRewardEarning,
  useCreatorRewardEarnings,
} from "~/hooks/use-creator-reward-earnings"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import {
  getDevLoginUserId,
  getViewerRequestHeaders,
  hasViewerRequestSession,
} from "~/lib/viewer-request-headers"
import { toResizedImageUrl } from "~/utils/resized-image-url"
import type { UserAvatarFramePresentation } from "~/utils/user-avatar-frame"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"

type ReceivedTransferHistoryItem = {
  senderUserId: string
  coinType: "FREE" | "PREMIUM"
  coinAmount: number
  ptAmount: number
  createdAt: number
}

type SupportSummaryResponse = {
  error: string | null
  data: {
    userId: string
    weekStartDate: string
    cumulativeReceivedPt: number
    cumulativeReceivedCoins: number
    cumulativeReceivedFreeCoins: number
    cumulativeReceivedPremiumCoins: number
    cumulativeReceivedFreePt: number
    cumulativeReceivedPremiumPt: number
    recentReceivedTransfers: ReceivedTransferHistoryItem[]
  } | null
}

type CoinSummaryResponse = {
  error: string | null
  data: {
    premiumBalance: number
    exchangeablePremiumBalance: number
    lockedExchangePremiumBalance: number
  } | null
}

const jstDateTimeFormatter = new Intl.DateTimeFormat("ja-JP", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
})

const formatDateTime = (unix: number) =>
  jstDateTimeFormatter.format(new Date(unix * 1000)).replace(/\//g, "/")

const formatNumber = (value: number) => value.toLocaleString()

export function SupportReceivedSummaryPage() {
  const t = useTranslation()
  const authContext = useContext(AuthContext)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("transfers")
  const [supportSummary, setSupportSummary] =
    useState<SupportSummaryResponse["data"]>(null)
  const [coinSummary, setCoinSummary] =
    useState<CoinSummaryResponse["data"]>(null)

  const { data: receivedCommentsData, loading: isLoadingReceivedComments } =
    useQuery(receivedWorkCommentsQuery, {
      skip: authContext.isLoading || authContext.isNotLoggedIn,
      variables: {
        offset: 0,
        limit: 50,
        onlySupportAttached: true,
      },
      fetchPolicy: "cache-and-network",
    })

  const receivedComments = receivedCommentsData?.receivedWorkComments ?? []

  // 受け取った推しの報酬（円）。参加していない人には参加の案内を出す
  const reward = useCreatorRewardEarnings(
    !authContext.isLoading && !authContext.isNotLoggedIn,
  )
  const rewardEarnings = reward.status === "joined" ? reward.earnings : []

  const loadData = async () => {
    if (!hasViewerRequestSession()) {
      setSupportSummary(null)
      setCoinSummary(null)
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const headers = await getViewerRequestHeaders({
        includeJsonContentType: true,
      })

      const userId = authContext.userId ?? getDevLoginUserId()
      if (!userId) {
        throw new Error(t("ログインが必要です", "Login required"))
      }

      const [supportRes, coinRes] = await Promise.all([
        fetch(`/api/coins/support/summary/${encodeURIComponent(userId)}`, {
          method: "GET",
          headers,
        }),
        fetch("/api/coins/summary", {
          method: "GET",
          headers,
        }),
      ])

      const [supportJson, coinJson] = await Promise.all([
        supportRes.json() as Promise<SupportSummaryResponse>,
        coinRes.json() as Promise<CoinSummaryResponse>,
      ])

      if (!supportRes.ok || supportJson.error || !supportJson.data) {
        throw new Error(
          supportJson.error ??
            t(
              "受け取り集計の読み込みに失敗しました",
              "Failed to load received support summary",
            ),
        )
      }

      if (!coinRes.ok || coinJson.error || !coinJson.data) {
        throw new Error(
          coinJson.error ??
            t("コイン情報の読み込みに失敗しました", "Failed to load coins"),
        )
      }

      setSupportSummary({
        ...supportJson.data,
        recentReceivedTransfers: Array.isArray(
          supportJson.data.recentReceivedTransfers,
        )
          ? supportJson.data.recentReceivedTransfers
          : [],
      })
      setCoinSummary(coinJson.data)
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authContext.isLoading, authContext.isNotLoggedIn, authContext.userId])

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-xl border p-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <p className="flex items-center gap-2 font-semibold text-lg">
            <Inbox className="h-5 w-5 text-emerald-500" />
            <span>{t("推された累計", "Received support")}</span>
          </p>
          <p className="text-muted-foreground text-sm leading-6">
            {t(
              "受け取った応援コインの累計 pt と、フリー / プレミアムの内訳を確認できます。全年齢の作品で受け取った有料のプレミアムコインは、クリエイター報酬（銀行振込）の対象になります。",
              "Review cumulative received support points with free/premium breakdowns. Purchased Premium Coins received on all-ages works are eligible for Creator Rewards (bank payout).",
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <CoinHelpDialog
            triggerLabel={t("推し・pt とは", "About support and pt")}
          />
          <Button asChild variant="outline" size="sm">
            <Link to="/help?tab=coins">
              {t("/help のガイド", "Guide on /help")}
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/settings/points">
              <ArrowLeftIcon className="h-4 w-4" />
              {t("コイン設定へ戻る", "Back to coins")}
            </Link>
          </Button>
          <Button
            onClick={() => void loadData()}
            variant="outline"
            size="sm"
            disabled={isLoading}
          >
            {isLoading ? t("更新中...", "Refreshing...") : t("更新", "Refresh")}
          </Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title={t("累計受取 pt", "Cumulative received pt")}
          value={`${formatNumber(supportSummary?.cumulativeReceivedPt ?? 0)} pt`}
          icon={<CoinsIcon className="h-4 w-4 text-emerald-500" />}
          detail={t(
            `累計 ${formatNumber(supportSummary?.cumulativeReceivedCoins ?? 0)} コイン`,
            `${formatNumber(supportSummary?.cumulativeReceivedCoins ?? 0)} coins total`,
          )}
        />
        <SummaryCard
          title={t("フリー受取内訳", "Free support breakdown")}
          value={`${formatNumber(supportSummary?.cumulativeReceivedFreePt ?? 0)} pt`}
          icon={<CoinIcon className="h-4 w-4 text-sky-500" />}
          detail={t(
            `${formatNumber(supportSummary?.cumulativeReceivedFreeCoins ?? 0)} コイン`,
            `${formatNumber(supportSummary?.cumulativeReceivedFreeCoins ?? 0)} coins`,
          )}
        />
        <SummaryCard
          title={t("プレミアム受取内訳", "Premium support breakdown")}
          value={`${formatNumber(supportSummary?.cumulativeReceivedPremiumPt ?? 0)} pt`}
          icon={<PremiumCoinIcon className="h-4 w-4 text-amber-500" />}
          detail={t(
            `${formatNumber(supportSummary?.cumulativeReceivedPremiumCoins ?? 0)} コイン`,
            `${formatNumber(supportSummary?.cumulativeReceivedPremiumCoins ?? 0)} coins`,
          )}
        />
      </div>

      {reward.status === "notJoined" ? (
        <CreatorRewardsJoinHint />
      ) : reward.status !== "joined" ? (
        <CreatorRewardsNotice />
      ) : null}

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="transfers">
            {t("受け取り履歴", "Received history")}
          </TabsTrigger>
          <TabsTrigger value="comments">
            {t("受け取ったコメント", "Received comments")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transfers">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <History className="h-4 w-4 text-muted-foreground" />
                {t("直近の受け取り履歴", "Recent received support")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {(supportSummary?.recentReceivedTransfers ?? []).length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  {t(
                    "まだ応援コインの受け取り履歴はありません。",
                    "No received support history yet.",
                  )}
                </p>
              ) : (
                (supportSummary?.recentReceivedTransfers ?? []).map(
                  (item, index) => (
                    <div
                      key={`${item.createdAt}-${item.senderUserId}-${index}`}
                      className="flex flex-col gap-1 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-sm">
                          {item.coinType === "PREMIUM"
                            ? t(
                                "プレミアム応援を受け取り",
                                "Received premium support",
                              )
                            : t(
                                "フリー応援を受け取り",
                                "Received free support",
                              )}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {formatDateTime(item.createdAt)}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                        {(() => {
                          const earning =
                            item.coinType === "PREMIUM"
                              ? findCreatorRewardEarning(rewardEarnings, {
                                  createdAt: item.createdAt,
                                })
                              : null
                          return earning ? (
                            <CreatorRewardBadge earning={earning} />
                          ) : null
                        })()}
                        <SupportTierChip
                          support={{
                            freeCoinAmount:
                              item.coinType === "FREE" ? item.coinAmount : 0,
                            premiumCoinAmount:
                              item.coinType === "PREMIUM" ? item.coinAmount : 0,
                            totalPt: item.ptAmount,
                          }}
                        />
                      </div>
                    </div>
                  ),
                )
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comments">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
                {t("受け取ったコメント一覧", "Received comments")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoadingReceivedComments ? (
                <p className="text-muted-foreground text-sm">
                  {t("コメントを読み込み中...", "Loading comments...")}
                </p>
              ) : receivedComments.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  {t(
                    "ポイント付きで受け取ったコメントはまだありません。",
                    "No support-attached comments yet.",
                  )}
                </p>
              ) : (
                receivedComments.map((comment) => (
                  <div key={comment.id} className="rounded-xl border p-3">
                    <div className="flex items-start gap-3">
                      <UserAvatarWithFrame
                        alt={comment.user?.name ?? ""}
                        frame={
                          (comment.user?.avatarFrame ??
                            null) as UserAvatarFramePresentation | null
                        }
                        isAnimated={false}
                        sizeClassName="size-10"
                        src={withIconUrlFallback(comment.user?.iconUrl)}
                      />
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-sm">
                            {comment.user?.name}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            {formatDateTime(comment.createdAt)}
                          </span>
                          {comment.work && (
                            <Link
                              to={`/posts/${comment.work.id}`}
                              className="text-xs text-primary hover:underline"
                            >
                              {comment.work.title}
                            </Link>
                          )}
                        </div>

                        {comment.work?.smallThumbnailImageURL && (
                          <Link
                            to={`/posts/${comment.work.id}`}
                            className="group block w-fit overflow-hidden rounded-md border"
                          >
                            <img
                              src={comment.work.smallThumbnailImageURL}
                              alt={comment.work.title || "work thumbnail"}
                              className="h-20 w-20 object-cover transition-opacity group-hover:opacity-90"
                            />
                          </Link>
                        )}

                        {comment.isDeleted ? (
                          // 推しコインは届いたまま。消したコメントの本文は出さない
                          <p className="text-muted-foreground text-sm">
                            {t(
                              "コメントは削除されました（推しは届いています）",
                              "The comment was deleted (the support was received)",
                            )}
                          </p>
                        ) : comment.text.length > 0 ? (
                          comment.support && comment.support.totalPt > 0 ? (
                            <SupportSuperChatCard support={comment.support}>
                              <p className="whitespace-pre-wrap text-sm leading-6">
                                {comment.text}
                              </p>
                            </SupportSuperChatCard>
                          ) : (
                            <p className="whitespace-pre-wrap text-sm leading-6">
                              {comment.text}
                            </p>
                          )
                        ) : (
                          <p className="text-muted-foreground text-sm">
                            {t("スタンプコメント", "Sticker comment")}
                          </p>
                        )}

                        {comment.sticker?.imageUrl && (
                          <div className="flex items-center gap-2">
                            <img
                              src={toResizedImageUrl(
                                comment.sticker.imageUrl,
                                240,
                              )}
                              alt={comment.sticker.title || "sticker"}
                              className="h-14 w-14 rounded-md object-cover"
                            />
                            {comment.sticker.title ? (
                              <span className="text-muted-foreground text-xs">
                                {t("スタンプ：", "Sticker: ")}
                                {comment.sticker.title}
                              </span>
                            ) : null}
                          </div>
                        )}

                        {comment.support && (
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <SupportTierChip support={comment.support} />
                            {(() => {
                              const earning =
                                comment.support.premiumCoinAmount > 0
                                  ? findCreatorRewardEarning(rewardEarnings, {
                                      createdAt: comment.createdAt,
                                      workId: comment.work?.id,
                                    })
                                  : null
                              return earning ? (
                                <CreatorRewardBadge earning={earning} />
                              ) : null
                            })()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function SummaryCard(props: {
  title: string
  value: string
  detail: string
  icon: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
          {props.icon}
          {props.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <p className="font-bold text-2xl">{props.value}</p>
        <p className="text-muted-foreground text-xs">{props.detail}</p>
      </CardContent>
    </Card>
  )
}

const receivedWorkCommentsQuery = graphql(
  `query ReceivedWorkComments(
    $offset: Int!
    $limit: Int!
    $onlySupportAttached: Boolean
  ) {
    receivedWorkComments(
      offset: $offset
      limit: $limit
      onlySupportAttached: $onlySupportAttached
    ) {
      id
      createdAt
      text
      isDeleted
      user {
        id
        name
        iconUrl
        avatarFrame {
          id
          frameType
          backgroundStyle
          overlayImageUrl
          borderPadding
        }
      }
      work {
        id
        title
        smallThumbnailImageURL
      }
      sticker {
        id
        imageUrl
        title
      }
      support {
        freeCoinAmount
        premiumCoinAmount
        totalPt
      }
    }
  }`,
)
