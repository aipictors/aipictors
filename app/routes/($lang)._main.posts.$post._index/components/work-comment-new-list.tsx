import { WorkComment } from "~/routes/($lang)._main.posts.$post._index/components/work-comment"
import type {
  WorkCommentListProps,
  WorkCommentListState,
} from "~/routes/($lang)._main.posts.$post._index/hooks/use-work-comment-list"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"

/**
 * 表示したあとに送ったコメント
 */
export function WorkCommentNewList(
  props: Pick<
    WorkCommentListState,
    | "appContext"
    | "canceledCommentIds"
    | "isCreatingCommentLike"
    | "isDeletingCommentLike"
    | "likedCommentIds"
    | "moderationSummaryMap"
    | "onCreateCommentLike"
    | "onDeleteComment"
    | "onDeleteCommentLike"
  > &
    Pick<
      WorkCommentListProps,
      "isWorkOwnerBlocked" | "workId" | "workOwnerIconImageURL"
    > & {
      showNewComments: NonNullable<WorkCommentListState["showNewComments"]>
    },
) {
  const {
    appContext,
    canceledCommentIds,
    isCreatingCommentLike,
    isDeletingCommentLike,
    likedCommentIds,
    moderationSummaryMap,
    onCreateCommentLike,
    onDeleteComment,
    onDeleteCommentLike,
    showNewComments,
  } = props

  return (
    <div className="space-y-4">
      {showNewComments.map((comment) => (
        <div key={`${props.workId}-${comment.id}`}>
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
            workOwnerIconImageURL={withIconUrlFallback(
              props.workOwnerIconImageURL,
            )}
            userIconImageURL={withIconUrlFallback(comment.user?.iconUrl)}
            userAvatarFrame={comment.user?.avatarFrame}
            userName={comment.user?.name}
            userIsOfficial={comment.user?.isOfficial}
            userIsModerator={comment.user?.isModerator}
            userCommentBadge={comment.user?.commentBadge}
            commentId={comment.id}
            isLiked={
              comment.isLiked && !canceledCommentIds.includes(comment.id)
            }
            isMuted={Boolean(comment.isMuted)}
            isSensitive={comment.isSensitive}
            moderationSummary={moderationSummaryMap.get(comment.id) ?? null}
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
          />
        </div>
      ))}
    </div>
  )
}
