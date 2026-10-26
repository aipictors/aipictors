import { graphql } from "gql.tada"

// 作品一覧などがコメント UI 全体を読み込まずに使えるよう、フラグメントだけを分けている
export const WorkCommentFragment = graphql(
  `fragment WorkComment on CommentNode @_unmask  {
    id
    createdAt
    text
    supportThankYouMessage
    support {
      freeCoinAmount
      premiumCoinAmount
      totalPt
    }
    likesCount
    isWorkOwnerLiked
    isLiked
    user {
      id
      name
      login
      iconUrl
      avatarFrame {
        id
        frameType
        backgroundStyle
        overlayImageUrl
        borderPadding
      }
      nanoid
    }
    sticker {
      id
      imageUrl
      title
      isDownloaded
      likesCount
      usesCount
      downloadsCount
      accessType
    }
    isMuted
    isSensitive
  }`,
)
