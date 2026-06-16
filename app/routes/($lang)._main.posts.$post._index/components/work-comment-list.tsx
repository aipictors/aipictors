import { gql, useMutation, useQuery } from "@apollo/client/index"
import { type FragmentOf, graphql } from "gql.tada"
import { Heart, Loader2Icon, StampIcon } from "lucide-react"
import { useContext, useEffect, useState } from "react"
import { toast } from "sonner"
import { useBoolean } from "usehooks-ts"
import { AutoResizeTextarea } from "~/components/auto-resize-textarea"
import { CoinIcon } from "~/components/coin-icon"
import { CrossPlatformTooltip } from "~/components/cross-platform-tooltip"
import { ExpansionTransition } from "~/components/expansion-transition"
import {
  FreeSupportCoinIcon,
  PremiumSupportCoinIcon,
} from "~/components/support-coin-icons"
import { SupportSuccessDialog } from "~/components/support-success-dialog"
import { Button } from "~/components/ui/button"
import { Checkbox } from "~/components/ui/checkbox"
import { Input } from "~/components/ui/input"
import { UserAvatarWithFrame } from "~/components/user/user-avatar-with-frame"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { getViewerRequestHeaders } from "~/lib/viewer-request-headers"
import type { CommentModerationSummaryState } from "~/routes/($lang)._main.posts.$post._index/components/comment-moderation-types"
import {
  StickerButton,
  StickerButtonFragment,
} from "~/routes/($lang)._main.posts.$post._index/components/sticker-button"
import { StickerDialog } from "~/routes/($lang)._main.posts.$post._index/components/sticker-dialog"
import {
  WorkComment,
  WorkCommentFragment,
} from "~/routes/($lang)._main.posts.$post._index/components/work-comment"
import { WorkCommentResponse } from "~/routes/($lang)._main.posts.$post._index/components/work-comment-response"
import {
  readRecentStickerIds,
  recordRecentStickerId,
  sortStickersByRecent,
} from "~/utils/sticker-recent"
import { consumeSupportSuccessDialogOpportunity } from "~/utils/support-success-dialog"
import { getApolloErrorMessage } from "~/utils/get-apollo-error-message"
import type { UserAvatarFramePresentation } from "~/utils/user-avatar-frame"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"

type Props = {
  workId: string
  workOwnerId?: string | null
  workOwnerIconImageURL?: string | null
  workOwnerName?: string | null
  comments: FragmentOf<typeof CommentListItemFragment>[]
  defaultShowCommentCount?: number
  isWorkOwnerBlocked?: boolean
  isLoadingComments?: boolean
}

// コメント
type Comment = {
  id: string
  text: string
  createdAt: number
  isLiked: boolean
  isMuted: boolean
  isSensitive?: boolean
  likesCount: number
  isWorkOwnerLiked: boolean
  user: {
    id: string
    name: string
    iconUrl: string
    avatarFrame?: UserAvatarFramePresentation | null
  }
  sticker: {
    image: {
      downloadURL: string
    }
  }
  support?: {
    freeCoinAmount: number
    premiumCoinAmount: number
    totalPt: number
  } | null
}

// 返信コメント
type ReplyComment = {
  replyTargetId: string
  id: string
  text: string
  createdAt: number
  isLiked: boolean
  isMuted: boolean
  isSensitive?: boolean
  likesCount: number
  isWorkOwnerLiked: boolean
  user: {
    id: string
    name: string
    iconUrl: string
    avatarFrame?: UserAvatarFramePresentation | null
  }
  sticker: {
    image: {
      downloadURL: string
    }
  }
}

type CommentSupportDraft = {
  freeCoinAmount: number
  premiumCoinAmount: number
  totalPt: number
}

const calculateCommentSupportDraft = (
  freeCoinAmount: number,
  premiumCoinAmount: number,
  freeCoinBalance: number,
  premiumCoinBalance: number,
) => {
  if (!Number.isInteger(freeCoinAmount) || freeCoinAmount < 0) return null
  if (!Number.isInteger(premiumCoinAmount) || premiumCoinAmount < 0) return null
  if (freeCoinAmount > freeCoinBalance || premiumCoinAmount > premiumCoinBalance) {
    return null
  }

  const totalCoins = freeCoinAmount + premiumCoinAmount

  if (totalCoins <= 0) {
    return null
  }

  return {
    freeCoinAmount,
    premiumCoinAmount,
    totalPt: freeCoinAmount + premiumCoinAmount * 10,
  } satisfies CommentSupportDraft
}

// 日本時間の日付を計算する関数
const getJSTDate = () => {
  const date = new Date()
  const utcOffset = date.getTimezoneOffset() * 60000 // 分単位のオフセットをミリ秒に変換
  const jstOffset = 9 * 60 * 60 * 1000 // JSTはUTC+9
  const jstDate = new Date(date.getTime() + utcOffset + jstOffset)
  return jstDate
}

/**
 * 作品へのコメント一覧
 */
export function WorkCommentList(props: Props) {
  const { value: isOpen, setTrue: onOpen, setFalse: onClose } = useBoolean()

  const t = useTranslation()

  const appContext = useContext(AuthContext)

  const [createWorkComment, { loading: isCreatingWorkComment }] = useMutation(
    createWorkCommentMutation,
  )

  const [createCommentLike, { loading: isCreatingCommentLike }] = useMutation(
    createCommentLikeMutation,
  )

  const [deleteCommentLike, { loading: isDeletingCommentLike }] = useMutation(
    deleteCommentLikeMutation,
  )

  const [comment, setComment] = useState("")
  const [isSupportOpen, setIsSupportOpen] = useState(false)
  const [supportFreeCoinAmount, setSupportFreeCoinAmount] = useState("0")
  const [supportPremiumCoinAmount, setSupportPremiumCoinAmount] = useState("0")
  const [coinBalances, setCoinBalances] = useState({
    freeBalance: 0,
    premiumBalance: 0,
  })
  const [isLoadingCoinSummary, setIsLoadingCoinSummary] = useState(false)
  const [supportSuccessState, setSupportSuccessState] = useState<{
    message: string
    totalPt: number
  } | null>(null)

  const [isSensitive, setIsSensitive] = useState(false)

  const [newComments, setNewComments] = useState<Comment[]>([])

  const [newReplyComments, setNewReplyComments] = useState<ReplyComment[]>([])

  const [hideCommentIds, setHideCommentIds] = useState<string[]>([])

  const showComments = props.comments.filter(
    (comment) => !hideCommentIds.includes(comment.id),
  )

  const authContext = useContext(AuthContext)
  const isOwnWork =
    authContext.userId !== null &&
    props.workOwnerId !== null &&
    props.workOwnerId !== undefined &&
    authContext.userId === props.workOwnerId

  const moderationCommentIds = Array.from(
    new Set(
      props.comments.flatMap((comment) => [
        comment.id,
        ...(comment.responses?.map((reply) => reply.id) ?? []),
      ]),
    ),
  )

  const { data: moderationData } = useQuery(commentModerationSummariesQuery, {
    skip:
      authContext.isLoading ||
      authContext.isNotLoggedIn ||
      moderationCommentIds.length === 0,
    variables: {
      commentIds: moderationCommentIds,
    },
  })

  const moderationSummaryMap = new Map<string, CommentModerationSummaryState>(
    (moderationData?.commentModerationSummaries ?? []).map(
      (summary: CommentModerationSummaryState) => [summary.commentId, summary],
    ),
  )

  const userResp = useQuery(userQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    variables: {
      userId: authContext.userId ?? "0",
    },
  })

  const userIcon = userResp?.data?.user?.iconUrl
  const userAvatarFrame = userResp?.data?.user?.avatarFrame ?? null

  const showNewComments = newComments?.filter(
    (comment) => !hideCommentIds.includes(comment.id),
  )

  const showNewReplyComments = newReplyComments?.filter(
    (comment) => !hideCommentIds.includes(comment.id),
  )

  const [likedCommentIds, setLikedCommentIds] = useState<string[]>([])

  const [canceledCommentIds, setCanceledCommentIds] = useState<string[]>([])
  const [recentStickerIds, setRecentStickerIds] = useState<string[]>([])

  useEffect(() => {
    if (newComments !== null) {
      setNewComments([])
    }
  }, [props.workId])

  useEffect(() => {
    if (!isSupportOpen || !authContext.isLoggedIn) {
      return
    }

    void reloadCoinSummary()
  }, [authContext.isLoggedIn, isSupportOpen])

  useEffect(() => {
    setRecentStickerIds(readRecentStickerIds())
  }, [])

  const fetchCoinSummary = async () => {
    const headers = await getViewerRequestHeaders({
      includeJsonContentType: true,
    })
    const res = await fetch("/api/coins/summary", {
      method: "GET",
      headers,
    })

    const json = (await res.json()) as {
      error?: string
      data?: {
        freeBalance?: number
        premiumBalance?: number
      }
    }

    if (!res.ok || json.error || !json.data) {
      return null
    }

    return {
      freeBalance: json.data.freeBalance ?? 0,
      premiumBalance: json.data.premiumBalance ?? 0,
    }
  }

  const reloadCoinSummary = async () => {
    if (!authContext.isLoggedIn) {
      return
    }

    try {
      setIsLoadingCoinSummary(true)
      const summary = await fetchCoinSummary()

      if (summary === null) {
        return
      }

      setCoinBalances(summary)
    } catch {
      return
    } finally {
      setIsLoadingCoinSummary(false)
    }
  }

  const currentSupportDraft = calculateCommentSupportDraft(
    Number(supportFreeCoinAmount) || 0,
    Number(supportPremiumCoinAmount) || 0,
    coinBalances.freeBalance,
    coinBalances.premiumBalance,
  )

  const hasSupportInput =
    (Number(supportFreeCoinAmount) || 0) > 0 ||
    (Number(supportPremiumCoinAmount) || 0) > 0

  const sendComment = async (
    text: string,
    stickerId: string,
    stickerImageURL: string,
    targetWorkId: string,
    iconUrl: string | null | undefined = null,
    supportDraft: CommentSupportDraft | null = null,
  ) => {
    try {
      if (hasSupportInput && supportDraft === null) {
        toast(
          t(
            "推しコイン数が不正です。保有コイン数を確認してください。",
            "Support coin amounts are invalid.",
          ),
        )
        return
      }

      if (supportDraft !== null && isOwnWork) {
        toast(
          t(
            "自分の作品には推しコインを付与できません。",
            "You cannot attach support coins to your own work.",
          ),
        )
        return
      }

      if (supportDraft !== null && authContext.isLoggedIn) {
        setIsLoadingCoinSummary(true)

        try {
          const latestSummary = await fetchCoinSummary()

          if (latestSummary !== null) {
            setCoinBalances(latestSummary)

            const latestSupportDraft = calculateCommentSupportDraft(
              supportDraft.freeCoinAmount,
              supportDraft.premiumCoinAmount,
              latestSummary.freeBalance,
              latestSummary.premiumBalance,
            )

            if (latestSupportDraft === null) {
              toast(
                t(
                  "コイン残高が足りません。残高を更新しました。",
                  "You do not have enough coins. The balance has been refreshed.",
                ),
              )
              return
            }

            supportDraft = latestSupportDraft
          }
        } finally {
          setIsLoadingCoinSummary(false)
        }
      }

      const confirmedSupportDraft = supportDraft

      if (targetWorkId !== undefined) {
        const res = await createWorkComment({
          variables: {
            input: {
              workId: targetWorkId,
              text: text,
              stickerId: stickerId,
              supportFreeCoinAmount: confirmedSupportDraft?.freeCoinAmount ?? 0,
              supportPremiumCoinAmount:
                confirmedSupportDraft?.premiumCoinAmount ?? 0,
              // TODO: Add isSensitive to GraphQL schema
              // isSensitive: isSensitive ?? false,
            },
          },
        })

        if (!res.data?.createWorkComment) {
          throw new Error(
            t(
              "スタンプの送信に失敗しました。しばらくしてから再度お試しください。",
              "Failed to send the sticker. Please try again later.",
            ),
          )
        }

        setComment("")
        setIsSensitive(false)
        setIsSupportOpen(false)
        setSupportFreeCoinAmount("0")
        setSupportPremiumCoinAmount("0")

        if (confirmedSupportDraft) {
          setCoinBalances((current) => ({
            freeBalance: Math.max(
              0,
              current.freeBalance - confirmedSupportDraft.freeCoinAmount,
            ),
            premiumBalance: Math.max(
              0,
              current.premiumBalance - confirmedSupportDraft.premiumCoinAmount,
            ),
          }))

          if (consumeSupportSuccessDialogOpportunity(props.workOwnerId)) {
            setSupportSuccessState({
              message: res.data.createWorkComment.supportThankYouMessage,
              totalPt: confirmedSupportDraft.totalPt,
            })
          }
        }

        setNewComments([
          {
            id: res.data.createWorkComment.id,
            text: text,
            createdAt: getJSTDate().getTime() / 1000,
            likesCount: 0,
            isWorkOwnerLiked: false,
            isLiked: false,
            user: {
              id: appContext.userId ?? "",
              name: appContext.displayName ?? "",
              iconUrl: withIconUrlFallback(iconUrl),
              avatarFrame: userAvatarFrame,
            },
            sticker: {
              image: {
                downloadURL: stickerImageURL,
              },
            },
            support: res.data.createWorkComment.support ?? null,
            isMuted: false,
            isSensitive: isSensitive,
            ...newComments,
          },
        ])
      }
    } catch (_e) {
      toast(
        getApolloErrorMessage(_e) ??
          t(
            "送信に失敗しました。しばらくしてから再度お試しください。",
            "Failed to send. Please try again later.",
          ),
      )
    }
  }

  const onCreateCommentLike = async (commentId: string) => {
    try {
      await createCommentLike({
        variables: {
          input: {
            commentId: commentId,
          },
        },
      })
      setLikedCommentIds([...likedCommentIds, commentId])
      setCanceledCommentIds(canceledCommentIds.filter((id) => id !== commentId))
    } catch (_e) {
      // toast(
      //   t(
      //     "いいねに失敗しました。通信エラーが発生しています。",
      //     "Failed to like. Please try again.",
      //   ),
      // )
    }
  }

  const onDeleteCommentLike = async (commentId: string) => {
    try {
      await deleteCommentLike({
        variables: {
          input: {
            commentId: commentId,
          },
        },
      })
      setLikedCommentIds(likedCommentIds.filter((id) => id !== commentId))
      setCanceledCommentIds([...canceledCommentIds, commentId])
    } catch (_e) {
      toast(
        t(
          "いいねの取り消しに失敗しました。通信エラーが発生しています。",
          "Failed to unlike. Please try again.",
        ),
      )
    }
  }

  const onDeleteComment = (commentId: string) => {
    setHideCommentIds([...hideCommentIds, commentId])
  }

  const onWorkComment = async () => {
    const inputComment = comment.trim()

    if (hasSupportInput && currentSupportDraft === null) {
      toast(
        t(
          "推しコイン数が不正です。保有コイン数を確認してください。",
          "Support coin amounts are invalid.",
        ),
      )
      return
    }

    if (inputComment === "" && currentSupportDraft === null) {
      toast(t("コメントを入力してください", "Please enter a comment"))
      return
    }

    sendComment(inputComment, "-1", "", props.workId, userIcon, currentSupportDraft)
  }

  const showCommentsBeforeMore = showComments.slice(
    0,
    props.defaultShowCommentCount ? props.defaultShowCommentCount : 8,
  )

  const showCommentsAfterMore = showComments.slice(
    props.defaultShowCommentCount ? props.defaultShowCommentCount : 8,
  )

  const { data = null } = useQuery(viewerUserQuery, {
    skip: authContext.isLoading,
  })

  const stickers = sortStickersByRecent(
    data?.viewer?.userStickers ?? [],
    recentStickerIds,
  )

  return (
    <>
      <div className="space-y-4">
        <p>
          {t("コメント", "Comments")} (
          {props.isLoadingComments &&
          showComments.length === 0 &&
          (showNewComments?.length ?? 0) === 0
            ? "..."
            : showComments.length + (showNewComments?.length ?? 0)}
          )
        </p>
        {props.isWorkOwnerBlocked && (
          <div className="rounded-md bg-gray-100 p-3 text-gray-600 text-sm dark:bg-gray-800 dark:text-gray-400">
            {t(
              "ブロック中のユーザーにはコメントできません",
              "Cannot comment to blocked users",
            )}
          </div>
        )}
        {stickers.length > 0 && !props.isWorkOwnerBlocked && (
          <div className="flex space-x-2 overflow-x-auto">
            {stickers.map((sticker) => (
              <StickerButton
                key={sticker.id}
                imageUrl={sticker.imageUrl ?? ""}
                title={sticker.title}
                onClick={async () => {
                  try {
                    setRecentStickerIds(recordRecentStickerId(sticker.id))
                    await sendComment(
                      comment,
                      sticker.id,
                      sticker.imageUrl ?? "",
                      props.workId,
                      userIcon,
                      currentSupportDraft,
                    )
                  } catch (error) {
                    toast(
                      getApolloErrorMessage(error) ??
                        t(
                          "スタンプの送信に失敗しました。しばらくしてから再度お試しください。",
                          "Failed to send the sticker. Please try again later.",
                        ),
                    )
                  }
                }}
                size="2x-large"
                disabled={props.isWorkOwnerBlocked}
              />
            ))}
          </div>
        )}

        <div className="space-y-3">
          <div className="flex w-full items-start gap-3">
            <UserAvatarWithFrame
              alt={appContext.displayName ?? ""}
              frame={userAvatarFrame}
              isAnimated={false}
              sizeClassName="size-10 shrink-0"
              src={withIconUrlFallback(userIcon)}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-stretch gap-3">
                <div className="min-w-0 flex-1">
                  <AutoResizeTextarea
                    autoResize={false}
                    onChange={(event) => {
                      setComment(event.target.value)
                    }}
                    rows={1}
                    value={comment}
                    placeholder={t("コメントする", "Add a comment")}
                    disabled={!authContext.isLoggedIn || props.isWorkOwnerBlocked}
                    className="h-[46px] min-h-[46px] w-full overflow-hidden rounded-2xl border-border/70 bg-background px-4 py-3"
                  />
                </div>
                {isCreatingWorkComment ? (
                  <Button
                    disabled
                    className="h-[46px] min-h-[46px] rounded-2xl px-5 text-sm"
                  >
                    <Loader2Icon className="size-4 animate-spin" />
                  </Button>
                ) : (
                  <Button
                    disabled={!authContext.isLoggedIn || props.isWorkOwnerBlocked}
                    variant="secondary"
                    onClick={onWorkComment}
                    className="h-[46px] min-h-[46px] rounded-2xl px-5 text-sm"
                  >
                    {t("送信", "Send")}
                  </Button>
                )}
              </div>
            </div>
          </div>
          {isSupportOpen && !props.isWorkOwnerBlocked && !isOwnWork && (
            <div className="rounded-xl border border-rose-200/80 bg-rose-50/80 p-3 dark:border-rose-900/60 dark:bg-rose-950/20">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-medium text-rose-700 dark:text-rose-200">
                  <Heart className="size-4 fill-rose-500 text-rose-500" />
                  <span>{t("推し付きコメント", "Support comment")}</span>
                </div>
                <div className="text-xs text-rose-700/80 dark:text-rose-200/80">
                  {isLoadingCoinSummary
                    ? t("読込中...", "Loading...")
                    : ""}
                </div>
              </div>
              {!isLoadingCoinSummary && (
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl bg-white/70 px-3 py-2 text-sm dark:bg-black/20">
                  <span className="font-medium text-rose-700/80 dark:text-rose-100/80">
                    {t("保有", "Balance")}
                  </span>
                  <span className="flex items-center gap-1.5 font-semibold text-foreground">
                    <FreeSupportCoinIcon className="h-4 w-4" />
                    <span>{coinBalances.freeBalance}</span>
                  </span>
                  <span className="flex items-center gap-1.5 font-semibold text-foreground">
                    <PremiumSupportCoinIcon className="h-4 w-4" />
                    <span>{coinBalances.premiumBalance}</span>
                  </span>
                </div>
              )}
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="flex items-center gap-1 text-xs text-muted-foreground">
                    <CoinIcon className="size-3.5" />
                    {t("フリー", "Free")}
                  </label>
                  <Input
                    inputMode="numeric"
                    min={0}
                    type="number"
                    value={supportFreeCoinAmount}
                    onChange={(event) =>
                      setSupportFreeCoinAmount(event.target.value)
                    }
                    disabled={!authContext.isLoggedIn}
                  />
                </div>
                <div className="space-y-1">
                  <label className="flex items-center gap-1 text-xs text-muted-foreground">
                    <PremiumSupportCoinIcon className="size-3.5" />
                    {t("プレミアム", "Premium")}
                  </label>
                  <Input
                    inputMode="numeric"
                    min={0}
                    type="number"
                    value={supportPremiumCoinAmount}
                    onChange={(event) =>
                      setSupportPremiumCoinAmount(event.target.value)
                    }
                    disabled={!authContext.isLoggedIn}
                  />
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                {currentSupportDraft ? (
                  <>
                    <span className="rounded-full bg-white/80 px-2.5 py-1 font-semibold text-rose-700 dark:bg-black/20 dark:text-rose-100">
                      {currentSupportDraft.totalPt}pt
                    </span>
                    {currentSupportDraft.freeCoinAmount > 0 && (
                      <span className="flex items-center gap-1 rounded-full border border-rose-200 bg-white/80 px-2 py-1 dark:border-rose-900/60 dark:bg-black/20">
                        <CoinIcon className="size-3.5" />
                        {currentSupportDraft.freeCoinAmount}
                      </span>
                    )}
                    {currentSupportDraft.premiumCoinAmount > 0 && (
                      <span className="flex items-center gap-1 rounded-full border border-rose-200 bg-white/80 px-2 py-1 dark:border-rose-900/60 dark:bg-black/20">
                        <PremiumSupportCoinIcon className="size-3.5" />
                        {currentSupportDraft.premiumCoinAmount}
                      </span>
                    )}
                  </>
                ) : hasSupportInput ? (
                  <span className="text-destructive">
                    {t(
                      "保有コイン数を超えています。",
                      "The amount exceeds your balance.",
                    )}
                  </span>
                ) : (
                  <span className="text-muted-foreground">
                    {t(
                      "0 のままなら通常コメントとして送信されます。",
                      "Zero values send a normal comment.",
                    )}
                  </span>
                )}
              </div>
            </div>
          )}
          <div className="flex flex-wrap items-center justify-between gap-3 pl-13 md:pl-14">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Checkbox
                id="sensitive-checkbox"
                checked={isSensitive}
                onCheckedChange={(checked: boolean) =>
                  setIsSensitive(checked === true)
                }
                disabled={!authContext.isLoggedIn || props.isWorkOwnerBlocked}
              />
              <label htmlFor="sensitive-checkbox">
                {t("隠し付き", "Sensitive comment")}
              </label>
              <CrossPlatformTooltip
                text={t(
                  "初期表示は非表示になります。クリックで表示されます。",
                  "You can check new works with this tag in your timeline",
                )}
              />
            </div>
            <div className="flex items-center gap-2">
              {!isOwnWork && (
                <Button
                  disabled={!authContext.isLoggedIn || props.isWorkOwnerBlocked}
                  variant="secondary"
                  size="icon"
                  className="h-11 w-11 rounded-2xl"
                  onClick={() => {
                    if (!isSupportOpen) {
                      void reloadCoinSummary()
                    }
                    setIsSupportOpen((value) => !value)
                  }}
                >
                  <Heart className="size-5" />
                </Button>
              )}
              <Button
                disabled={!authContext.isLoggedIn || props.isWorkOwnerBlocked}
                variant="secondary"
                size="icon"
                className="h-11 w-11 rounded-2xl"
                onClick={onOpen}
              >
                <StampIcon className="size-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-4 overflow-y-auto">
        {props.isLoadingComments &&
          showComments.length === 0 &&
          (showNewComments?.length ?? 0) === 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2Icon className="size-4 animate-spin" />
              <span>{t("コメントを読み込み中", "Loading comments")}</span>
            </div>
          )}
        {showNewComments && (
          <div className="space-y-4">
            {showNewComments.map((comment) => (
              <div key={`${props.workId}-${comment.id}`}>
                <WorkComment
                  userId={comment.user?.id ?? ""}
                  isMine={comment.user?.id === appContext.userId}
                  createdAt={comment.createdAt}
                  support={comment.support ?? null}
                  stickerImageURL={comment.sticker?.image?.downloadURL}
                  text={comment.text}
                  workOwnerIconImageURL={withIconUrlFallback(
                    props.workOwnerIconImageURL,
                  )}
                  userIconImageURL={withIconUrlFallback(comment.user?.iconUrl)}
                  userAvatarFrame={comment.user?.avatarFrame}
                  userName={comment.user?.name}
                  commentId={comment.id}
                  isLiked={
                    comment.isLiked && !canceledCommentIds.includes(comment.id)
                  }
                  isMuted={Boolean(comment.isMuted)}
                  isSensitive={comment.isSensitive}
                  moderationSummary={
                    moderationSummaryMap.get(comment.id) ?? null
                  }
                  isNowLiked={likedCommentIds.includes(comment.id)}
                  likesCount={
                    comment.likesCount -
                    (canceledCommentIds.includes(comment.id) ? 1 : 0)
                  }
                  isWorkOwnerLiked={comment.isWorkOwnerLiked}
                  isLoadingCommentLike={
                    isCreatingCommentLike || isDeletingCommentLike
                  }
                  onCreateCommentLike={() => onCreateCommentLike(comment.id)}
                  onDeleteCommentLike={() => onDeleteCommentLike(comment.id)}
                  onDeleteComment={() => onDeleteComment(comment.id)}
                  isWorkOwnerBlocked={props.isWorkOwnerBlocked}
                  onReplyCompleted={(
                    id: string,
                    text: string,
                    _stickerId: string,
                    stickerImageURL: string,
                  ) => {
                    setNewComments([
                      {
                        id: id,
                        text: text,
                        createdAt: getJSTDate().getTime() / 1000,
                        likesCount: 0,
                        isWorkOwnerLiked: false,
                        isLiked: false,
                        user: {
                          id: appContext.userId ?? "",
                          name: appContext.displayName ?? "",
                          iconUrl: withIconUrlFallback(userIcon),
                          avatarFrame: userAvatarFrame,
                        },
                        sticker: {
                          image: {
                            downloadURL: stickerImageURL,
                          },
                        },
                        isMuted: false,
                        ...newComments,
                      },
                    ])
                  }}
                />
              </div>
            ))}
          </div>
        )}
        {showCommentsBeforeMore.map((comment) => (
          <div key={comment.id} className="space-y-4">
            <WorkComment
              userId={comment.user?.id ?? ""}
              isMine={comment.user?.id === appContext.userId}
              createdAt={comment.createdAt}
              support={comment.support ?? null}
              stickerImageURL={comment.sticker?.imageUrl ?? ""}
              stickerTitle={comment.sticker?.title}
              stickerId={comment.sticker?.id}
              stickerAccessType={comment.sticker?.accessType}
              isStickerDownloadable={comment.sticker?.isDownloaded}
              text={comment.text}
              userName={comment.user?.name}
              commentId={comment.id}
              isLiked={
                comment.isLiked && !canceledCommentIds.includes(comment.id)
              }
              isMuted={Boolean(comment.isMuted)}
              isSensitive={Boolean(comment.isSensitive)}
              moderationSummary={moderationSummaryMap.get(comment.id) ?? null}
              isNowLiked={likedCommentIds.includes(comment.id)}
              likesCount={
                comment.likesCount -
                (canceledCommentIds.includes(comment.id) ? 1 : 0)
              }
              isWorkOwnerLiked={comment.isWorkOwnerLiked}
              onCreateCommentLike={() => onCreateCommentLike(comment.id)}
              onDeleteCommentLike={() => onDeleteCommentLike(comment.id)}
              isDisabledCommentLike={!appContext.isLoggedIn}
              isLoadingCommentLike={
                isCreatingCommentLike || isDeletingCommentLike
              }
              workOwnerIconImageURL={withIconUrlFallback(
                props.workOwnerIconImageURL,
              )}
              userIconImageURL={withIconUrlFallback(comment.user?.iconUrl)}
              userAvatarFrame={comment.user?.avatarFrame}
              onDeleteComment={() => onDeleteComment(comment.id)}
              isWorkOwnerBlocked={props.isWorkOwnerBlocked}
              onReplyCompleted={(
                id: string,
                text: string,
                _stickerId: string,
                stickerImageURL: string,
              ) => {
                setNewReplyComments([
                  ...newReplyComments,
                  {
                    replyTargetId: comment.id,
                    id: id,
                    text: text,
                    createdAt: Date.now(),
                    likesCount: 0,
                    isWorkOwnerLiked: false,
                    isLiked: false,
                    isMuted: false,
                    isSensitive: false, // TODO: Get this value from ReplyCommentInput
                    user: {
                      id: appContext.userId ?? "",
                      name: appContext.displayName ?? "",
                      iconUrl: withIconUrlFallback(userIcon),
                    },
                    sticker: {
                      image: {
                        downloadURL: stickerImageURL,
                      },
                    },
                  },
                ])
              }}
            />
            {/* 新しく追加した返信への返信 */}
            {showNewReplyComments?.map((newReply) =>
              newReply.replyTargetId !== comment.id ? null : (
                <WorkCommentResponse
                  key={newReply.id}
                  userId={newReply.user?.id ?? ""}
                  isMine={newReply.user?.id === appContext.userId}
                  createdAt={newReply.createdAt}
                  stickerImageURL={newReply.sticker?.image?.downloadURL}
                  text={newReply.text}
                  iconUrl={withIconUrlFallback(userIcon)}
                  userName={newReply.user?.name}
                  replyId={newReply.id}
                  targetCommentId={comment.id}
                  isLiked={
                    newReply.isLiked &&
                    !canceledCommentIds.includes(newReply.id)
                  }
                  isMuted={newReply.isMuted}
                  isSensitive={newReply.isSensitive}
                  moderationSummary={
                    moderationSummaryMap.get(newReply.id) ?? null
                  }
                  isNowLiked={likedCommentIds.includes(newReply.id)}
                  likesCount={
                    newReply.likesCount -
                    (canceledCommentIds.includes(newReply.id) ? 1 : 0)
                  }
                  isWorkOwnerLiked={newReply.isWorkOwnerLiked}
                  isLoadingCommentLike={
                    isCreatingCommentLike || isDeletingCommentLike
                  }
                  onCreateCommentLike={() => onCreateCommentLike(newReply.id)}
                  onDeleteCommentLike={() => onDeleteCommentLike(newReply.id)}
                  onDeleteComment={() => {
                    onDeleteComment(newReply.id)
                  }}
                  isWorkOwnerBlocked={props.isWorkOwnerBlocked}
                />
              ),
            )}
            {/* コメントへの返信 */}
            {comment.responses !== null &&
              comment.responses?.length !== 0 &&
              comment.responses
                // .sort((a, b) => a.createdAt - b.createdAt)
                .filter((reply) => !hideCommentIds.includes(reply.id))
                .map((reply) => (
                  <WorkCommentResponse
                    key={reply.id}
                    userId={reply.user?.id ?? ""}
                    isMine={reply.user?.id === appContext.userId}
                    createdAt={reply.createdAt}
                    stickerImageURL={reply.sticker?.imageUrl ?? ""}
                    stickerTitle={reply.sticker?.title}
                    stickerId={reply.sticker?.id}
                    stickerAccessType={reply.sticker?.accessType}
                    isStickerDownloadable={reply.sticker?.isDownloaded}
                    isWorkOwnerLiked={reply.isWorkOwnerLiked}
                    isDisabledCommentLike={!appContext.isLoggedIn}
                    text={reply.text}
                    userIconImageURL={withIconUrlFallback(reply.user?.iconUrl)}
                    userAvatarFrame={reply.user?.avatarFrame}
                    isLiked={
                      reply.isLiked && !canceledCommentIds.includes(reply.id)
                    }
                    isMuted={Boolean(reply.isMuted)}
                    isSensitive={Boolean(reply.isSensitive)}
                    moderationSummary={
                      moderationSummaryMap.get(reply.id) ?? null
                    }
                    isNowLiked={likedCommentIds.includes(reply.id)}
                    likesCount={
                      reply.likesCount -
                      (canceledCommentIds.includes(reply.id) ? 1 : 0)
                    }
                    onCreateCommentLike={() => onCreateCommentLike(reply.id)}
                    onDeleteCommentLike={() => onDeleteCommentLike(reply.id)}
                    userName={reply.user?.name}
                    replyId={reply.id}
                    targetCommentId={comment.id}
                    iconUrl={withIconUrlFallback(userIcon)}
                    onDeleteComment={() => {
                      onDeleteComment(reply.id)
                    }}
                    isWorkOwnerBlocked={props.isWorkOwnerBlocked}
                    onReplyCompleted={(
                      id: string,
                      text: string,
                      _stickerId: string,
                      stickerImageURL: string,
                    ) => {
                      // 表示コメントを追加
                      setNewReplyComments([
                        ...newReplyComments,
                        {
                          replyTargetId: comment.id,
                          id: id,
                          text: text,
                          createdAt: Date.now(),
                          likesCount: 0,
                          isWorkOwnerLiked: false,
                          isLiked: false,
                          isMuted: false,
                          isSensitive: false, // TODO: Get this value from ReplyCommentInput
                          user: {
                            id: appContext.userId ?? "",
                            name: appContext.displayName ?? "",
                            iconUrl: withIconUrlFallback(userIcon),
                            avatarFrame: userAvatarFrame,
                          },
                          sticker: {
                            image: {
                              downloadURL: stickerImageURL,
                            },
                          },
                        },
                      ])
                    }}
                  />
                ))}
          </div>
        ))}
        {showCommentsAfterMore.length > 0 && (
          <ExpansionTransition
            triggerChildren={
              <Button className="w-full" variant={"secondary"}>
                {t("もっと見る", "Load more")} ({showCommentsAfterMore.length})
              </Button>
            }
            oneTimeExpand={true}
            className="flex flex-col space-y-4"
          >
            {showCommentsAfterMore.map((comment) => (
              <div key={comment.id} className="space-y-4">
                <WorkComment
                  userId={comment.user?.id ?? ""}
                  isMine={comment.user?.id === appContext.userId}
                  createdAt={comment.createdAt}
                  support={comment.support ?? null}
                  stickerImageURL={comment.sticker?.imageUrl ?? ""}
                  stickerTitle={comment.sticker?.title}
                  stickerId={comment.sticker?.id}
                  stickerAccessType={comment.sticker?.accessType}
                  isStickerDownloadable={comment.sticker?.isDownloaded}
                  isWorkOwnerLiked={comment.isWorkOwnerLiked}
                  workOwnerIconImageURL={withIconUrlFallback(
                    props.workOwnerIconImageURL,
                  )}
                  userIconImageURL={withIconUrlFallback(comment.user?.iconUrl)}
                  userAvatarFrame={comment.user?.avatarFrame}
                  isLiked={
                    comment.isLiked && !canceledCommentIds.includes(comment.id)
                  }
                  isMuted={Boolean(comment.isMuted)}
                  isSensitive={Boolean(comment.isSensitive)}
                  moderationSummary={
                    moderationSummaryMap.get(comment.id) ?? null
                  }
                  isNowLiked={likedCommentIds.includes(comment.id)}
                  likesCount={
                    comment.likesCount -
                    (canceledCommentIds.includes(comment.id) ? 1 : 0)
                  }
                  onCreateCommentLike={() => onCreateCommentLike(comment.id)}
                  onDeleteCommentLike={() => onDeleteCommentLike(comment.id)}
                  isDisabledCommentLike={!appContext.isLoggedIn}
                  isLoadingCommentLike={
                    isCreatingCommentLike || isDeletingCommentLike
                  }
                  text={comment.text}
                  userName={comment.user?.name}
                  commentId={comment.id}
                  onDeleteComment={() => onDeleteComment(comment.id)}
                  isWorkOwnerBlocked={props.isWorkOwnerBlocked}
                  onReplyCompleted={(
                    id: string,
                    text: string,
                    _stickerId: string,
                    stickerImageURL: string,
                  ) => {
                    setNewReplyComments([
                      ...(newReplyComments || []),
                      {
                        replyTargetId: comment.id,
                        id: id,
                        text: text,
                        createdAt: Date.now(),
                        likesCount: 0,
                        isWorkOwnerLiked: false,
                        isLiked: false,
                        isMuted: false,
                        isSensitive: false, // TODO: Get this value from ReplyCommentInput
                        user: {
                          id: appContext.userId ?? "",
                          name: appContext.displayName ?? "",
                          iconUrl: withIconUrlFallback(userIcon),
                        },
                        sticker: {
                          image: {
                            downloadURL: stickerImageURL,
                          },
                        },
                      },
                    ])
                  }}
                />
                {/* 新しく追加した返信への返信 */}
                {showNewReplyComments?.map((newReply) =>
                  newReply.replyTargetId !== comment.id ? null : (
                    <WorkCommentResponse
                      key={newReply.id}
                      userId={newReply.user?.id ?? ""}
                      isMine={newReply.user?.id === appContext.userId}
                      createdAt={newReply.createdAt}
                      stickerImageURL={newReply.sticker?.image?.downloadURL}
                      text={newReply.text}
                      iconUrl={withIconUrlFallback(userIcon)}
                      isWorkOwnerLiked={newReply.isWorkOwnerLiked}
                      isNowLiked={likedCommentIds.includes(newReply.id)}
                      workOwnerIconImageURL={withIconUrlFallback(
                        props.workOwnerIconImageURL,
                      )}
                      userIconImageURL={withIconUrlFallback(
                        newReply.user.iconUrl,
                      )}
                      userAvatarFrame={newReply.user?.avatarFrame}
                      isLiked={
                        newReply.isLiked &&
                        !canceledCommentIds.includes(newReply.id)
                      }
                      isMuted={newReply.isMuted}
                      isSensitive={newReply.isSensitive}
                      moderationSummary={
                        moderationSummaryMap.get(newReply.id) ?? null
                      }
                      likesCount={
                        newReply.likesCount -
                        (canceledCommentIds.includes(newReply.id) ? 1 : 0)
                      }
                      onCreateCommentLike={() =>
                        onCreateCommentLike(newReply.id)
                      }
                      onDeleteCommentLike={() =>
                        onDeleteCommentLike(newReply.id)
                      }
                      userName={newReply.user?.name}
                      replyId={newReply.id}
                      targetCommentId={comment.id}
                      onDeleteComment={() => {
                        onDeleteComment(newReply.id)
                      }}
                      isWorkOwnerBlocked={props.isWorkOwnerBlocked}
                    />
                  ),
                )}
                {/* コメントへの返信 */}
                {comment.responses !== null &&
                  comment.responses?.length !== 0 &&
                  comment.responses
                    // .sort((a, b) => a.createdAt - b.createdAt)
                    .filter((reply) => !hideCommentIds.includes(reply.id))
                    .map((reply) => (
                      <WorkCommentResponse
                        key={reply.id}
                        userId={reply.user?.id ?? ""}
                        isMine={reply.user?.id === appContext.userId}
                        createdAt={reply.createdAt}
                        stickerImageURL={reply.sticker?.imageUrl ?? ""}
                        stickerTitle={reply.sticker?.title}
                        stickerId={reply.sticker?.id}
                        stickerAccessType={reply.sticker?.accessType}
                        isStickerDownloadable={reply.sticker?.isDownloaded}
                        isDisabledCommentLike={!appContext.isLoggedIn}
                        isWorkOwnerLiked={reply.isWorkOwnerLiked}
                        workOwnerIconImageURL={withIconUrlFallback(
                          props.workOwnerIconImageURL,
                        )}
                        isNowLiked={likedCommentIds.includes(reply.id)}
                        isLiked={
                          reply.isLiked &&
                          !canceledCommentIds.includes(reply.id)
                        }
                        isMuted={Boolean(reply.isMuted)}
                        isSensitive={Boolean(reply.isSensitive)}
                        moderationSummary={
                          moderationSummaryMap.get(reply.id) ?? null
                        }
                        likesCount={
                          reply.likesCount -
                          (canceledCommentIds.includes(reply.id) ? 1 : 0)
                        }
                        onCreateCommentLike={() =>
                          onCreateCommentLike(reply.id)
                        }
                        onDeleteCommentLike={() =>
                          onDeleteCommentLike(reply.id)
                        }
                        text={reply.text}
                        userIconImageURL={withIconUrlFallback(
                          reply.user?.iconUrl,
                        )}
                        userAvatarFrame={reply.user?.avatarFrame}
                        userName={reply.user?.name}
                        replyId={reply.id}
                        targetCommentId={comment.id}
                        iconUrl={withIconUrlFallback(userIcon)}
                        onDeleteComment={() => {
                          onDeleteComment(reply.id)
                        }}
                        isWorkOwnerBlocked={props.isWorkOwnerBlocked}
                        onReplyCompleted={(
                          id: string,
                          text: string,
                          _stickerId: string,
                          stickerImageURL: string,
                        ) => {
                          // 表示コメントを追加
                          setNewReplyComments([
                            ...newReplyComments,
                            {
                              replyTargetId: comment.id,
                              id: id,
                              text: text,
                              createdAt: Date.now(),
                              likesCount: 0,
                              isWorkOwnerLiked: false,
                              isLiked: false,
                              isMuted: false,
                              isSensitive: false, // TODO: Get this value from ReplyCommentInput
                              user: {
                                id: appContext.userId ?? "",
                                name: appContext.displayName ?? "",
                                iconUrl: withIconUrlFallback(userIcon),
                                avatarFrame: userAvatarFrame,
                              },
                              sticker: {
                                image: {
                                  downloadURL: stickerImageURL,
                                },
                              },
                            },
                          ])
                        }}
                      />
                    ))}
              </div>
            ))}
          </ExpansionTransition>
        )}
      </div>
      <StickerDialog
        isOpen={isOpen}
        onClose={onClose}
        onSend={async (stickerId: string, url: string) => {
          setRecentStickerIds(recordRecentStickerId(stickerId))
          await sendComment(
            comment,
            stickerId,
            url,
            props.workId,
            userIcon,
            currentSupportDraft,
          )
        }}
        isTargetUserBlocked={props.isWorkOwnerBlocked}
      />
      <SupportSuccessDialog
        open={supportSuccessState !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSupportSuccessState(null)
          }
        }}
        targetUserIconUrl={props.workOwnerIconImageURL}
        targetUserName={props.workOwnerName ?? t("クリエイター", "Creator")}
        thankYouMessage={supportSuccessState?.message ?? ""}
        totalPt={supportSuccessState?.totalPt}
      />
    </>
  )
}

const userQuery = graphql(
  `query User(
    $userId: ID!,
  ) {
    user(id: $userId) {
      id
      iconUrl
    }
  }`,
)

export const CommentListItemFragment = graphql(
  `fragment Comment on CommentNode @_unmask {
      ...WorkComment
      responses(offset: 0, limit: 128) {
        ...WorkComment
      }
  }`,
  [WorkCommentFragment],
)

const createWorkCommentMutation = graphql(
  `
  mutation CreateWorkComment($input: CreateWorkCommentInput!) {
    createWorkComment(input: $input) {
      ...WorkComment
    }
  }
`,
  [WorkCommentFragment],
)

const createCommentLikeMutation = graphql(
  `mutation CreateCommentLike($input: CreateCommentLikeInput!) {
    createCommentLike(input: $input) {
      id
    }
  }`,
)

const deleteCommentLikeMutation = graphql(
  `mutation DeleteCommentLike($input: DeleteCommentLikeInput!) {
    deleteCommentLike(input: $input) {
      id
    }
  }`,
)

const viewerUserQuery = graphql(
  `query ViewerUser {
    viewer {
      id
      user {
        id
        iconUrl
      }
      userStickers(offset: 0, limit: 5, orderBy: DATE_USED) {
        ...StickerButton
      }
    }
  }`,
  [StickerButtonFragment],
)

const commentModerationSummariesQuery = gql`
  query CommentModerationSummaries($commentIds: [ID!]!) {
    commentModerationSummaries(commentIds: $commentIds) {
      commentId
      moderationStatus
      userNotice
      canAppeal
      appealedAt
    }
  }
`
