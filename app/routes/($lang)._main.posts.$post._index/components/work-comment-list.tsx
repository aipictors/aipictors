import { toast } from "sonner"
import { ExpansionTransition } from "~/components/expansion-transition"
import { SupportSuccessDialog } from "~/components/support-success-dialog"
import { Button } from "~/components/ui/button"
import { useTranslation } from "~/hooks/use-translation"
import { StickerButton } from "~/routes/($lang)._main.posts.$post._index/components/sticker-button"
import { StickerDialog } from "~/routes/($lang)._main.posts.$post._index/components/sticker-dialog"
import { WorkCommentExpandedThread } from "~/routes/($lang)._main.posts.$post._index/components/work-comment-expanded-thread"
import { WorkCommentForm } from "~/routes/($lang)._main.posts.$post._index/components/work-comment-form"
import { WorkCommentNewList } from "~/routes/($lang)._main.posts.$post._index/components/work-comment-new-list"
import { WorkCommentPremiumResultDialog } from "~/routes/($lang)._main.posts.$post._index/components/work-comment-premium-result-dialog"
import { WorkCommentThread } from "~/routes/($lang)._main.posts.$post._index/components/work-comment-thread"
import {
  useWorkCommentList,
  type WorkCommentListProps,
} from "~/routes/($lang)._main.posts.$post._index/hooks/use-work-comment-list"
import { useProgressiveCount } from "~/routes/($lang)._main.posts.$post._index/hooks/use-progressive-count"
import { LazyPurchasePremiumCoinsDialog as PurchasePremiumCoinsDialog } from "~/routes/($lang).settings.points/components/lazy-purchase-premium-coins-dialog"
import { getApolloErrorMessage } from "~/utils/get-apollo-error-message"
import { recordRecentStickerId } from "~/utils/sticker-recent"

export { CommentListItemFragment } from "~/routes/($lang)._main.posts.$post._index/components/work-comment-list-queries"

/** 作品のページで最初に描画するコメントの数（取得が終わる前は 0 件なので、件数からは決めない） */
const INITIAL_COMMENT_COUNT = 8

/**
 * 作品へのコメント一覧
 */
export function WorkCommentList(props: WorkCommentListProps) {
  const t = useTranslation()
  const state = useWorkCommentList(props)
  const {
    coinBalances,
    comment,
    currentSupportDraft,
    isOpen,
    isPremiumPurchaseDialogOpen,
    location,
    onClose,
    sendComment,
    setIsPremiumPurchaseDialogOpen,
    setRecentStickerIds,
    setSupportSuccessState,
    showComments,
    showCommentsAfterMore,
    showCommentsBeforeMore,
    showNewComments,
    stickers,
    supportSuccessState,
    userIcon,
  } = state

  // 作品のページは押さずに全件読める。フィードと管理画面は枠が狭いのでボタンのまま
  const isAutoReveal = props.defaultShowCommentCount === undefined
  const { count: revealedCount, sentinelRef } = useProgressiveCount(
    showComments.length,
    INITIAL_COMMENT_COUNT,
    props.workId,
  )

  return (
    <>
      <div className="space-y-4">
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
      {stickers.length > 0 && !props.isWorkOwnerBlocked && (
        <div className="flex gap-1 overflow-x-auto [scrollbar-width:thin]">
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
              size="x-large"
              disabled={props.isWorkOwnerBlocked}
            />
          ))}
        </div>
      )}

      <div className="mt-6 space-y-5 overflow-y-auto">
        {props.isLoadingComments &&
          showComments.length === 0 &&
          (showNewComments?.length ?? 0) === 0 && (
            // 届く前に場所を取っておく（下の一覧が押し下げられないように）
            <div
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
        {(isAutoReveal
          ? showComments.slice(0, revealedCount)
          : showCommentsBeforeMore
        ).map((comment) => (
          <WorkCommentThread
            key={comment.id}
            {...state}
            comment={comment}
            isWorkOwnerBlocked={props.isWorkOwnerBlocked}
            workOwnerIconImageURL={props.workOwnerIconImageURL}
          />
        ))}
        {isAutoReveal && revealedCount < showComments.length && (
          <div ref={sentinelRef} aria-hidden="true" className="h-px" />
        )}
        {!isAutoReveal && showCommentsAfterMore.length > 0 && (
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

      <PurchasePremiumCoinsDialog
        currentBalance={coinBalances.premiumBalance}
        open={isPremiumPurchaseDialogOpen}
        onOpenChange={setIsPremiumPurchaseDialogOpen}
        hideTrigger
        successPath={location.pathname}
        cancelPath={location.pathname}
      />

      <WorkCommentPremiumResultDialog {...state} />
    </>
  )
}
