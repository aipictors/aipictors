import { useMutation, useQuery } from "@apollo/client/index"
import { useLocation, useSearchParams } from "@remix-run/react"
import type { FragmentOf } from "gql.tada"
import { useContext, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { useBoolean } from "usehooks-ts"
import { useSupportUserOnlyErrorText } from "~/components/support-super-chat"
import { AuthContext } from "~/contexts/auth-context"
import { usePinnedStickers } from "~/hooks/use-pinned-stickers"
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
  type Comment,
  clearPremiumCheckoutSearchParams,
  excludeShownComments,
  fetchCoinSummary,
  type ReplyComment,
} from "~/routes/($lang)._main.posts.$post._index/components/work-comment-list-utils"
import { usePremiumCheckoutConfirmation } from "~/routes/($lang)._main.posts.$post._index/hooks/use-premium-checkout-confirmation"
import { isEmptyComment } from "~/utils/empty-comment"
import { logEvent } from "~/utils/event-log"
import { getApolloErrorMessage } from "~/utils/get-apollo-error-message"
import {
  readRecentStickerIds,
  sortStickersByRecent,
} from "~/utils/sticker-recent"
import { isSupportUserOnlyError } from "~/utils/support-user-only"
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
  const supportUserOnlyErrorText = useSupportUserOnlyErrorText()

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
  // 作品への推し（推し付きコメント）は終了した。コメントはふつうのコメントだけ。
  // 残高は、プレミアムコインの購入から戻ってきたときの確認でだけ使う
  const [coinBalances, setCoinBalances] = useState({
    freeBalance: 0,
    premiumBalance: 0,
  })
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
    (comment) =>
      !hideCommentIds.includes(comment.id) &&
      // 中身のないコメント（本文・スタンプのない、過去の推しだけのもの）は出さない。返信が付いていれば残す
      !(isEmptyComment(comment) && (comment.responses?.length ?? 0) === 0),
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
    setRecentStickerIds(readRecentStickerIds())
  }, [])

  const reloadCoinSummary = async () => {
    if (!authContext.isLoggedIn) {
      return
    }

    try {
      const summary = await fetchCoinSummary()

      if (summary === null) {
        return
      }

      setCoinBalances(summary)
    } catch {
      return
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

  const sendComment = async (
    text: string,
    stickerId: string,
    targetWorkId: string,
  ) => {
    try {
      if (targetWorkId !== undefined) {
        const res = await createWorkComment({
          variables: {
            input: {
              workId: targetWorkId,
              text: text,
              stickerId: stickerId,
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

        logEvent("comment", {
          source: stickerId ? "sticker" : "text",
          coins: 0,
        })
        clearCommentDraft()
        setComment("")
        setIsSensitive(false)

        setNewComments([
          { ...res.data.createWorkComment, isSensitive },
          ...newComments,
        ])
      }
    } catch (_e) {
      const errorMessage = getApolloErrorMessage(_e)
      if (isSupportUserOnlyError({ message: errorMessage })) {
        toast(supportUserOnlyErrorText)
        return
      }
      toast(
        errorMessage ??
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

    if (inputComment === "") {
      toast(t("コメントを入力してください", "Please enter a comment"))
      return
    }

    sendComment(inputComment, "-1", props.workId)
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
    hideCommentIds,
    isConfirmingPremiumPurchase,
    isCreatingCommentLike,
    isCreatingWorkComment,
    isDeletingCommentLike,
    isOpen,
    isOwnWork,
    isPremiumPurchaseDialogOpen,
    isPremiumPurchaseResultDialogOpen,
    isSensitive,
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
    setNewComments,
    setNewReplyComments,
    setRecentStickerIds,
    showComments,
    showCommentsAfterMore,
    showCommentsBeforeMore,
    showNewComments,
    showNewReplyComments,
    stickers,
    pinnedStickers,
    userAvatarFrame,
    userIcon,
  }
}

export type WorkCommentListState = ReturnType<typeof useWorkCommentList>
