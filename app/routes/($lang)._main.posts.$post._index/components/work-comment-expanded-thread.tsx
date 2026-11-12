import type { FragmentOf } from "gql.tada"
import { WorkComment } from "~/routes/($lang)._main.posts.$post._index/components/work-comment"
import type { CommentListItemFragment } from "~/routes/($lang)._main.posts.$post._index/components/work-comment-list-queries"
import { WorkCommentResponse } from "~/routes/($lang)._main.posts.$post._index/components/work-comment-response"
import type {
  WorkCommentListProps,
  WorkCommentListState,
} from "~/routes/($lang)._main.posts.$post._index/hooks/use-work-comment-list"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"

/**
 * 「もっと見る」を押したあとのコメントと返信
 */
export function WorkCommentExpandedThread(
  props: Pick<
    WorkCommentListState,
    | "appContext"
    | "canceledCommentIds"
    | "isCreatingCommentLike"
    | "isDeletingCommentLike"
    | "likedCommentIds"
    | "moderationSummaryMap"
    | "newReplyComments"
    | "onCreateCommentLike"
    | "onDeleteComment"
    | "onDeleteCommentLike"
    | "setNewReplyComments"
    | "showNewReplyComments"
    | "userIcon"
    | "hideCommentIds"
  > &
    Pick<
      WorkCommentListProps,
      "isWorkOwnerBlocked" | "workOwnerIconImageURL"
    > & {
      comment: FragmentOf<typeof CommentListItemFragment>
    },
) {
  const {
    appContext,
    canceledCommentIds,
    comment,
    isCreatingCommentLike,
    isDeletingCommentLike,
    likedCommentIds,
    moderationSummaryMap,
    newReplyComments,
    onCreateCommentLike,
    onDeleteComment,
    onDeleteCommentLike,
    setNewReplyComments,
    showNewReplyComments,
    userIcon,
    hideCommentIds,
  } = props

  return (
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
        workOwnerIconImageURL={withIconUrlFallback(props.workOwnerIconImageURL)}
        userIconImageURL={withIconUrlFallback(comment.user?.iconUrl)}
        userAvatarFrame={comment.user?.avatarFrame}
        isLiked={comment.isLiked && !canceledCommentIds.includes(comment.id)}
        isMuted={Boolean(comment.isMuted)}
        isSensitive={Boolean(comment.isSensitive)}
        moderationSummary={moderationSummaryMap.get(comment.id) ?? null}
        isNowLiked={likedCommentIds.includes(comment.id)}
        likesCount={
          comment.likesCount - (canceledCommentIds.includes(comment.id) ? 1 : 0)
        }
        onCreateCommentLike={() => onCreateCommentLike(comment.id)}
        onDeleteCommentLike={() => onDeleteCommentLike(comment.id)}
        isDisabledCommentLike={!appContext.isLoggedIn}
        isLoadingCommentLike={isCreatingCommentLike || isDeletingCommentLike}
        text={comment.text}
        userName={comment.user?.name}
        userIsOfficial={comment.user?.isOfficial}
        userIsModerator={comment.user?.isModerator}
        userCommentBadge={comment.user?.commentBadge}
        commentId={comment.id}
        onDeleteComment={() => onDeleteComment(comment.id)}
        isWorkOwnerBlocked={props.isWorkOwnerBlocked}
        onReplyCompleted={(reply) => {
          setNewReplyComments([
            ...newReplyComments,
            { ...reply, replyTargetId: comment.id },
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
            stickerImageURL={newReply.sticker?.imageUrl ?? ""}
            stickerTitle={newReply.sticker?.title}
            stickerId={newReply.sticker?.id}
            stickerAccessType={newReply.sticker?.accessType}
            isStickerDownloadable={newReply.sticker?.isDownloaded}
            text={newReply.text}
            iconUrl={withIconUrlFallback(userIcon)}
            isWorkOwnerLiked={newReply.isWorkOwnerLiked}
            isNowLiked={likedCommentIds.includes(newReply.id)}
            workOwnerIconImageURL={withIconUrlFallback(
              props.workOwnerIconImageURL,
            )}
            userIconImageURL={withIconUrlFallback(newReply.user?.iconUrl)}
            userAvatarFrame={newReply.user?.avatarFrame}
            isLiked={
              newReply.isLiked && !canceledCommentIds.includes(newReply.id)
            }
            isMuted={newReply.isMuted}
            isSensitive={newReply.isSensitive}
            moderationSummary={moderationSummaryMap.get(newReply.id) ?? null}
            likesCount={
              newReply.likesCount -
              (canceledCommentIds.includes(newReply.id) ? 1 : 0)
            }
            onCreateCommentLike={() => onCreateCommentLike(newReply.id)}
            onDeleteCommentLike={() => onDeleteCommentLike(newReply.id)}
            userName={newReply.user?.name}
            userIsOfficial={newReply.user?.isOfficial}
            userIsModerator={newReply.user?.isModerator}
            userCommentBadge={newReply.user?.commentBadge}
            replyId={newReply.id}
            targetCommentId={comment.id}
            replyToUserName={comment.user?.name}
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
              isLiked={reply.isLiked && !canceledCommentIds.includes(reply.id)}
              isMuted={Boolean(reply.isMuted)}
              isSensitive={Boolean(reply.isSensitive)}
              moderationSummary={moderationSummaryMap.get(reply.id) ?? null}
              likesCount={
                reply.likesCount -
                (canceledCommentIds.includes(reply.id) ? 1 : 0)
              }
              onCreateCommentLike={() => onCreateCommentLike(reply.id)}
              onDeleteCommentLike={() => onDeleteCommentLike(reply.id)}
              text={reply.text}
              userIconImageURL={withIconUrlFallback(reply.user?.iconUrl)}
              userAvatarFrame={reply.user?.avatarFrame}
              userName={reply.user?.name}
              userIsOfficial={reply.user?.isOfficial}
              userIsModerator={reply.user?.isModerator}
              userCommentBadge={reply.user?.commentBadge}
              replyId={reply.id}
              targetCommentId={comment.id}
              replyToUserName={comment.user?.name}
              iconUrl={withIconUrlFallback(userIcon)}
              onDeleteComment={() => {
                onDeleteComment(reply.id)
              }}
              isWorkOwnerBlocked={props.isWorkOwnerBlocked}
              onReplyCompleted={(reply) => {
                setNewReplyComments([
                  ...newReplyComments,
                  { ...reply, replyTargetId: comment.id },
                ])
              }}
            />
          ))}
    </div>
  )
}
