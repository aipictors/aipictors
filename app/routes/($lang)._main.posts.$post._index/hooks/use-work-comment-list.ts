import { usePinnedStickers } from "~/hooks/use-pinned-stickers"
import { useMutation, useQuery } from "@apollo/client/index"
import { useLocation, useSearchParams } from "@remix-run/react"
import type { FragmentOf } from "gql.tada"
import { useContext, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { useBoolean } from "usehooks-ts"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { useNavigate } from "~/lib/app/locale-router"
import type { CommentModerationSummaryState } from "~/routes/($lang)._main.posts.$post._index/components/comment-moderation-types"
import {
  type CommentListItemFragment,
  commentModerationSummariesQuery,
  createCommentLikeMutation,
  createWorkCommentMutation,
  deleteCommentLikeMutation,
  userQuery,
  viewerUserQuery,
} from "~/routes/($lang)._main.posts.$post._index/components/work-comment-list-queries"
import {
  calculateCommentSupportDraft,
  clearPremiumCheckoutSearchParams,
  type Comment,
  type CommentSupportDraft,
  excludeShownComments,
  fetchCoinSummary,
  type ReplyComment,
  SUPPORT_CONFIRM_THRESHOLD_PT,
} from "~/routes/($lang)._main.posts.$post._index/components/work-comment-list-utils"
import { usePremiumCheckoutConfirmation } from "~/routes/($lang)._main.posts.$post._index/hooks/use-premium-checkout-confirmation"
import { getApolloErrorMessage } from "~/utils/get-apollo-error-message"
import {
  readRecentStickerIds,
  sortStickersByRecent,
} from "~/utils/sticker-recent"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"

export type WorkCommentListProps = {
  workId: string
  workOwnerId?: string | null
  workOwnerIconImageURL?: string | null
  workOwnerName?: string | null
  comments: FragmentOf<typeof CommentListItemFragment>[]
  defaultShowCommentCount?: number
  isWorkOwnerBlocked?: boolean
  isLoadingComments?: boolean
}

/**
 * 作品へのコメント一覧の状態と操作
 */
export function useWorkCommentList(props: WorkCommentListProps) {
  const { value: isOpen, setTrue: onOpen, setFalse: onClose } = useBoolean()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const checkoutState = searchParams.get("checkout")
  const checkoutSessionId = searchParams.get("session_id")

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
  const [supportCoinType, setSupportCoinType] = useState<"FREE" | "PREMIUM">(
    "FREE",
  )
  const [supportFreeCoinAmount, setSupportFreeCoinAmount] = useState("0")
  const [supportPremiumCoinAmount, setSupportPremiumCoinAmount] = useState("0")
  const [supportIsAnonymous, setSupportIsAnonymous] = useState(false)
  const [coinBalances, setCoinBalances] = useState({
    freeBalance: 0,
    premiumBalance: 0,
  })
  const [isLoadingCoinSummary, setIsLoadingCoinSummary] = useState(false)
  const [supportSuccessState, setSupportSuccessState] = useState<{
    message: string
    totalPt: number
  } | null>(null)
  const [isPremiumPurchaseDialogOpen, setIsPremiumPurchaseDialogOpen] =
    useState(false)
  const [isConfirmingPremiumPurchase, setIsConfirmingPremiumPurchase] =
    useState(false)
  const [
    isPremiumPurchaseResultDialogOpen,
    setIsPremiumPurchaseResultDialogOpen,
  ] = useState(false)
  const [premiumPurchaseError, setPremiumPurchaseError] = useState<
    string | null
  >(null)
  const [confirmedPremiumCoins, setConfirmedPremiumCoins] = useState<
    number | null
  >(null)
  const handledPremiumCheckoutSessionRef = useRef<string | null>(null)

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

  // 一覧を読み直して届いたものは一覧の側で出す
  const showNewComments = excludeShownComments(
    newComments,
    moderationCommentIds,
    hideCommentIds,
  )

  const showNewReplyComments = excludeShownComments(
    newReplyComments,
    moderationCommentIds,
    hideCommentIds,
  )

  const [likedCommentIds, setLikedCommentIds] = useState<string[]>([])

  const [canceledCommentIds, setCanceledCommentIds] = useState<string[]>([])
  const [recentStickerIds, setRecentStickerIds] = useState<string[]>([])
  const commentDraftStorageKey = `aipictors:work-comment-draft:${props.workId}`
  const skipNextDraftPersistRef = useRef(true)

  const clearCommentDraft = () => {
    if (typeof window === "undefined") {
      return
    }

    try {
      window.localStorage.removeItem(commentDraftStorageKey)
    } catch {
      // localStorage が使えなくてもコメント送信自体は継続する。
    }
  }

  useEffect(() => {
    if (newComments !== null) {
      setNewComments([])
    }
    // 残すと作品に戻ったときに、読み込み直した返信と二重に並ぶ
    setNewReplyComments([])
  }, [props.workId])

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    skipNextDraftPersistRef.current = true

    try {
      const stored = window.localStorage.getItem(commentDraftStorageKey)
      setComment(stored ?? "")
    } catch {
      setComment("")
    }
  }, [commentDraftStorageKey])

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    if (skipNextDraftPersistRef.current) {
      skipNextDraftPersistRef.current = false
      return
    }

    try {
      if (comment.trim().length === 0) {
        window.localStorage.removeItem(commentDraftStorageKey)
        return
      }

      window.localStorage.setItem(commentDraftStorageKey, comment)
    } catch {
      // localStorage が使えなくても入力・送信自体は継続する。
    }
  }, [comment, commentDraftStorageKey])

  useEffect(() => {
    if (!isSupportOpen || !authContext.isLoggedIn) {
      return
    }

    void reloadCoinSummary()
  }, [authContext.isLoggedIn, isSupportOpen])

  useEffect(() => {
    setRecentStickerIds(readRecentStickerIds())
  }, [])

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

  usePremiumCheckoutConfirmation({
    appContext,
    checkoutSessionId,
    checkoutState,
    clearPremiumCheckoutSearchParams,
    handledPremiumCheckoutSessionRef,
    location,
    navigate,
    reloadCoinSummary,
    setConfirmedPremiumCoins,
    setIsConfirmingPremiumPurchase,
    setIsPremiumPurchaseDialogOpen,
    setIsPremiumPurchaseResultDialogOpen,
    setPremiumPurchaseError,
    t,
  })

  const currentSupportDraft = calculateCommentSupportDraft(
    Number(supportFreeCoinAmount) || 0,
    Number(supportPremiumCoinAmount) || 0,
    coinBalances.freeBalance,
    coinBalances.premiumBalance,
  )

  const currentFreeSupportCoinAmount = Number(supportFreeCoinAmount) || 0
  const currentPremiumSupportCoinAmount = Number(supportPremiumCoinAmount) || 0

  const hasSupportInput =
    currentFreeSupportCoinAmount > 0 || currentPremiumSupportCoinAmount > 0

  /** コインの種類は 1 つずつ。選び直すと金額もそちらだけになる */
  const setSupportCoinAmount = (
    coinType: "FREE" | "PREMIUM",
    amount: string,
  ) => {
    setSupportFreeCoinAmount(coinType === "FREE" ? amount : "0")
    setSupportPremiumCoinAmount(coinType === "PREMIUM" ? amount : "0")
  }

  const sendComment = async (
    text: string,
    stickerId: string,
    targetWorkId: string,
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

      if (
        supportDraft !== null &&
        supportDraft.totalPt >= SUPPORT_CONFIRM_THRESHOLD_PT &&
        !window.confirm(
          t(
            `${supportDraft.totalPt.toLocaleString()}pt（フリー ${supportDraft.freeCoinAmount.toLocaleString()}・プレミアム ${supportDraft.premiumCoinAmount.toLocaleString()}）を推しとして送ります。よろしいですか？`,
            `Send ${supportDraft.totalPt.toLocaleString()}pt (free ${supportDraft.freeCoinAmount}, premium ${supportDraft.premiumCoinAmount})?`,
          ),
        )
      ) {
        return
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
              supportIsAnonymous,
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

        clearCommentDraft()
        setComment("")
        setIsSensitive(false)
        setIsSupportOpen(false)
        setSupportFreeCoinAmount("0")
        setSupportPremiumCoinAmount("0")
        setSupportIsAnonymous(false)

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

          setSupportSuccessState({
            message: res.data.createWorkComment.supportThankYouMessage,
            totalPt: confirmedSupportDraft.totalPt,
          })
        }

        setNewComments([
          { ...res.data.createWorkComment, isSensitive },
          ...newComments,
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

    sendComment(
      inputComment,
      "-1",
      props.workId,
      currentSupportDraft,
    )
  }

  const showCommentsBeforeMore = showComments.slice(
    0,
    props.defaultShowCommentCount ? props.defaultShowCommentCount : 8,
  )

  const showCommentsAfterMore = showComments.slice(
    props.defaultShowCommentCount ? props.defaultShowCommentCount : 8,
  )

  const { data = null } = useQuery(viewerUserQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
  })

  const { pinnedStickers } = usePinnedStickers()

  const stickers = sortStickersByRecent(
    data?.viewer?.userStickers ?? [],
    recentStickerIds,
  ).filter(
    (sticker) => !pinnedStickers.some((pinned) => pinned.id === sticker.id),
  )

  return {
    appContext,
    authContext,
    canceledCommentIds,
    clearPremiumCheckoutSearchParams,
    coinBalances,
    comment,
    confirmedPremiumCoins,
    currentFreeSupportCoinAmount,
    currentPremiumSupportCoinAmount,
    currentSupportDraft,
    hideCommentIds,
    isConfirmingPremiumPurchase,
    isCreatingCommentLike,
    isCreatingWorkComment,
    isDeletingCommentLike,
    isLoadingCoinSummary,
    isOpen,
    isOwnWork,
    isPremiumPurchaseDialogOpen,
    isPremiumPurchaseResultDialogOpen,
    isSensitive,
    isSupportOpen,
    likedCommentIds,
    location,
    moderationSummaryMap,
    newComments,
    newReplyComments,
    onClose,
    onCreateCommentLike,
    onDeleteComment,
    onDeleteCommentLike,
    onOpen,
    onWorkComment,
    premiumPurchaseError,
    reloadCoinSummary,
    sendComment,
    setComment,
    setIsPremiumPurchaseDialogOpen,
    setIsPremiumPurchaseResultDialogOpen,
    setIsSensitive,
    setIsSupportOpen,
    setNewComments,
    setNewReplyComments,
    setRecentStickerIds,
    setSupportCoinAmount,
    setSupportCoinType,
    setSupportIsAnonymous,
    setSupportSuccessState,
    showComments,
    showCommentsAfterMore,
    showCommentsBeforeMore,
    showNewComments,
    showNewReplyComments,
    stickers,
    pinnedStickers,
    supportCoinType,
    supportFreeCoinAmount,
    supportIsAnonymous,
    supportPremiumCoinAmount,
    supportSuccessState,
    userAvatarFrame,
    userIcon,
  }
}

export type WorkCommentListState = ReturnType<typeof useWorkCommentList>
