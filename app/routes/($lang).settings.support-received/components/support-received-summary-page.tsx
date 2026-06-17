import { useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { Link } from "@remix-run/react"
import {
  ArrowLeftIcon,
  CoinsIcon,
  Gift,
  History,
  Inbox,
  MessageCircle,
} from "lucide-react"
import { useContext, useEffect, useState } from "react"
import { toast } from "sonner"
import { CoinIcon } from "~/components/coin-icon"
import { CoinHelpDialog } from "~/components/coin-help-dialog"
import { PremiumCoinIcon } from "~/components/premium-coin-icon"
import { PremiumSupportCoinIcon } from "~/components/support-coin-icons"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { UserAvatarWithFrame } from "~/components/user/user-avatar-with-frame"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import {
  getDevLoginUserId,
  getViewerRequestHeaders,
  hasViewerRequestSession,
} from "~/lib/viewer-request-headers"
import { AmazonExchangeSection } from "~/routes/($lang).settings.points/components/amazon-exchange-section"
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
  const [coinSummary, setCoinSummary] = useState<CoinSummaryResponse["data"]>(
    null,
  )

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
            <span>{t("推された累計と交換", "Received support & exchange")}</span>
          </p>
          <p className="text-muted-foreground text-sm leading-6">
            {t(
              "受け取った応援コインの累計 pt と、フリー / プレミアムの内訳を確認できます。プレミアム受け取り分はこのページから Amazon ギフト券交換を申請できます。",
              "Review cumulative received support points with free/premium breakdowns. Premium coins received from supporters can be exchanged for Amazon Gift Cards from this page.",
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <CoinHelpDialog triggerLabel={t("推し・pt とは", "About support and pt")} />
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
          <Button onClick={() => void loadData()} variant="outline" size="sm" disabled={isLoading}>
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
        <SummaryCard
          title={t("交換可能プレミアム", "Exchangeable premium")}
          value={`${formatNumber(coinSummary?.exchangeablePremiumBalance ?? 0)} coins`}
          icon={<Gift className="h-4 w-4 text-violet-500" />}
          detail={t(
            `申請ロック中 ${formatNumber(coinSummary?.lockedExchangePremiumBalance ?? 0)} コイン`,
            `${formatNumber(coinSummary?.lockedExchangePremiumBalance ?? 0)} coins locked in pending requests`,
          )}
        />
      </div>

      <AmazonExchangeSection
        premiumBalance={coinSummary?.premiumBalance ?? 0}
        exchangeablePremiumBalance={coinSummary?.exchangeablePremiumBalance ?? 0}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
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
                (supportSummary?.recentReceivedTransfers ?? []).map((item, index) => (
                  <div
                    key={`${item.createdAt}-${item.senderUserId}-${index}`}
                    className="flex flex-col gap-1 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-sm">
                        {item.coinType === "PREMIUM"
                          ? t("プレミアム応援を受け取り", "Received premium support")
                          : t("フリー応援を受け取り", "Received free support")}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {formatDateTime(item.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <p>
                        {formatNumber(item.coinAmount)}
                        {t("コイン", " coins")}
                      </p>
                      <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {formatNumber(item.ptAmount)} pt
                      </p>
                    </div>
                  </div>
                ))
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
                        alt={comment.user.name}
                        frame={comment.user.avatarFrame as UserAvatarFramePresentation | null}
                        isAnimated={false}
                        sizeClassName="size-10"
                        src={withIconUrlFallback(comment.user.iconUrl)}
                      />
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-sm">{comment.user.name}</span>
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

                        {comment.text.length > 0 ? (
                          <p className="whitespace-pre-wrap text-sm leading-6">
                            {comment.text}
                          </p>
                        ) : (
                          <p className="text-muted-foreground text-sm">
                            {t("スタンプコメント", "Sticker comment")}
                          </p>
                        )}

                        {comment.sticker?.imageUrl && (
                          <div className="flex items-center gap-2">
                            <img
                              src={comment.sticker.imageUrl}
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
                            <span className="rounded-full bg-rose-100 px-2.5 py-1 font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-100">
                              +{comment.support.totalPt}pt
                            </span>
                            {comment.support.freeCoinAmount > 0 && (
                              <span className="flex items-center gap-1 rounded-full border px-2 py-1">
                                <CoinIcon className="size-3.5" />
                                {comment.support.freeCoinAmount}
                              </span>
                            )}
                            {comment.support.premiumCoinAmount > 0 && (
                              <span className="flex items-center gap-1 rounded-full border px-2 py-1">
                                <PremiumSupportCoinIcon className="size-3.5" />
                                {comment.support.premiumCoinAmount}
                              </span>
                            )}
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