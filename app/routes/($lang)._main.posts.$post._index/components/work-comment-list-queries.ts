import { gql } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { StickerButtonFragment } from "~/routes/($lang)._main.posts.$post._index/components/sticker-button"
import { WorkCommentFragment } from "~/routes/($lang)._main.posts.$post._index/components/work-comment"

export const userQuery = graphql(
  `query User(
    $userId: ID!,
  ) {
    user(id: $userId) {
      id
      iconUrl
      avatarFrame {
        id
        frameType
        backgroundStyle
        overlayImageUrl
        borderPadding
      }
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

export const createWorkCommentMutation = graphql(
  `
  mutation CreateWorkComment($input: CreateWorkCommentInput!) {
    createWorkComment(input: $input) {
      ...WorkComment
    }
  }
`,
  [WorkCommentFragment],
)

export const createCommentLikeMutation = graphql(
  `mutation CreateCommentLike($input: CreateCommentLikeInput!) {
    createCommentLike(input: $input) {
      id
    }
  }`,
)

export const deleteCommentLikeMutation = graphql(
  `mutation DeleteCommentLike($input: DeleteCommentLikeInput!) {
    deleteCommentLike(input: $input) {
      id
    }
  }`,
)

export const viewerUserQuery = graphql(
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

export const commentModerationSummariesQuery = gql`
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
