import { toast } from "sonner"
import { ExpansionTransition } from "~/components/expansion-transition"
import { Button } from "~/components/ui/button"
import { useTranslation } from "~/hooks/use-translation"
import { CommentReactionsProvider } from "~/routes/($lang)._main.posts.$post._index/components/comment-reactions"
import { StickerDialog } from "~/routes/($lang)._main.posts.$post._index/components/sticker-dialog"
import { WorkCommentExpandedThread } from "~/routes/($lang)._main.posts.$post._index/components/work-comment-expanded-thread"
import { WorkCommentForm } from "~/routes/($lang)._main.posts.$post._index/components/work-comment-form"
import { WorkCommentNewList } from "~/routes/($lang)._main.posts.$post._index/components/work-comment-new-list"
import { WorkCommentPremiumResultDialog } from "~/routes/($lang)._main.posts.$post._index/components/work-comment-premium-result-dialog"
import { WorkCommentQuickStickers } from "~/routes/($lang)._main.posts.$post._index/components/work-comment-quick-stickers"
import { WorkCommentThread } from "~/routes/($lang)._main.posts.$post._index/components/work-comment-thread"
import {
  useWorkCommentList,
  type WorkCommentListProps,
} from "~/routes/($lang)._main.posts.$post._index/hooks/use-work-comment-list"
import { LazyPurchasePremiumCoinsDialog as PurchasePremiumCoinsDialog } from "~/routes/($lang).settings.points/components/lazy-purchase-premium-coins-dialog"
import { getApolloErrorMessage } from "~/utils/get-apollo-error-message"
import { recordRecentStickerId } from "~/utils/sticker-recent"

export { CommentListItemFragment } from "~/routes/($lang)._main.posts.$post._index/components/work-comment-list-queries"

/**
 * 作品へのコメント一覧
 */
export function WorkCommentList(props: WorkCommentListProps) {
  const t = useTranslation()
  const state = useWorkCommentList(props)
  const {
    coinBalances,
    comment,
    isOpen,
    isPremiumPurchaseDialogOpen,
    location,
    onClose,
    sendComment,
    setIsPremiumPurchaseDialogOpen,
    setRecentStickerIds,
    showComments,
    showCommentsAfterMore,
    showCommentsBeforeMore,
    showNewComments,
    stickers,
    pinnedStickers,
  } = state

  const onSendQuickSticker = async (stickerId: string) => {
    try {
      setRecentStickerIds(recordRecentStickerId(stickerId))
      await sendComment(comment, stickerId, props.workId)
    } catch (error) {
      toast(
        getApolloErrorMessage(error) ??
          t(
            "スタンプの送信に失敗しました。しばらくしてから再度お試しください。",
            "Failed to send the sticker. Please try again later.",
          ),
      )
    }
  }

  // リアクションはコメントと返信の分をまとめて読む
  const reactionCommentIds = showComments.flatMap((item) => [
    item.id,
    ...(item.responses?.map((reply) => reply.id) ?? []),
  ])

  return (
    <CommentReactionsProvider commentIds={reactionCommentIds}>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="flex items-baseline gap-2 font-bold text-base">
            {t("コメント", "Comments")}
            <span className="font-normal text-muted-foreground text-sm tabular-nums">
              {props.isLoadingComments &&
              showComments.length === 0 &&
              (showNewComments?.length ?? 0) === 0
                ? ""
                : showComments.length + (showNewComments?.length ?? 0)}
            </span>
          </h2>
        </div>
        {props.isWorkOwnerBlocked && (
          <div className="rounded-md bg-gray-100 p-3 text-gray-600 text-sm dark:bg-gray-800 dark:text-gray-400">
            {t(
              "ブロック中のユーザーにはコメントできません",
              "Cannot comment to blocked users",
            )}
          </div>
        )}
        <WorkCommentForm
          {...state}
          isWorkOwnerBlocked={props.isWorkOwnerBlocked}
        />
      </div>
      {!props.isWorkOwnerBlocked && (
        <WorkCommentQuickStickers
          pinnedStickers={pinnedStickers}
          recentStickers={stickers}
          disabled={state.isCreatingWorkComment}
          onSend={(stickerId) => void onSendQuickSticker(stickerId)}
          onOpenAll={state.onOpen}
        />
      )}

      <div className="mt-6 space-y-5 overflow-y-auto">
        {props.isLoadingComments &&
          showComments.length === 0 &&
          (showNewComments?.length ?? 0) === 0 && (
            // 届く前に場所を取っておく（下の一覧が押し下げられないように）
            <div
              role="status"
              className="space-y-5"
              aria-label={t("コメントを読み込み中", "Loading comments")}
            >
              {[0, 1, 2].map((index) => (
                <div key={index} className="flex animate-pulse gap-3">
                  <div className="size-9 shrink-0 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-3 w-28 rounded bg-muted" />
                    <div className="h-3 w-3/4 rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          )}
        {showNewComments && (
          <WorkCommentNewList
            {...state}
            showNewComments={showNewComments}
            isWorkOwnerBlocked={props.isWorkOwnerBlocked}
            workId={props.workId}
            workOwnerIconImageURL={props.workOwnerIconImageURL}
          />
        )}
        {showCommentsBeforeMore.map((comment) => (
          <WorkCommentThread
            key={comment.id}
            {...state}
            comment={comment}
            isWorkOwnerBlocked={props.isWorkOwnerBlocked}
            workOwnerIconImageURL={props.workOwnerIconImageURL}
          />
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
              <WorkCommentExpandedThread
                key={comment.id}
                {...state}
                comment={comment}
                isWorkOwnerBlocked={props.isWorkOwnerBlocked}
                workOwnerIconImageURL={props.workOwnerIconImageURL}
              />
            ))}
          </ExpansionTransition>
        )}
      </div>
      <StickerDialog
        isOpen={isOpen}
        onClose={onClose}
        onSend={async (stickerId: string) => {
          setRecentStickerIds(recordRecentStickerId(stickerId))
          await sendComment(comment, stickerId, props.workId)
        }}
        isTargetUserBlocked={props.isWorkOwnerBlocked}
      />

      <PurchasePremiumCoinsDialog
        currentBalance={coinBalances.premiumBalance}
        open={isPremiumPurchaseDialogOpen}
        onOpenChange={setIsPremiumPurchaseDialogOpen}
        hideTrigger
        successPath={location.pathname}
        cancelPath={location.pathname}
      />

      <WorkCommentPremiumResultDialog {...state} />
    </CommentReactionsProvider>
  )
}
