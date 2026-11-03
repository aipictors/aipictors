import { graphql } from "gql.tada"

const PanelLikedFragment = graphql(
  `fragment PanelLiked on LikedWorkNotificationNode @_unmask {
    id
    createdAt
    work { id title enTitle smallThumbnailImageURL }
    user { id name iconUrl }
  }`,
)

const PanelCommentFragment = graphql(
  `fragment PanelComment on WorkCommentNotificationNode @_unmask {
    id
    createdAt
    message
    work { id title enTitle smallThumbnailImageURL }
    user { id name iconUrl }
    sticker { id imageUrl }
    myReplies { id text sticker { id imageUrl } }
    support { freeCoinAmount premiumCoinAmount totalPt }
    replyTargetCommentId
  }`,
)

const PanelReplyFragment = graphql(
  `fragment PanelReply on WorkCommentReplyNotificationNode @_unmask {
    id
    createdAt
    message
    work { id title enTitle smallThumbnailImageURL }
    user { id name iconUrl }
    sticker { id imageUrl }
    support { freeCoinAmount premiumCoinAmount totalPt }
    replyTargetCommentId
    comment { id text sticker { id imageUrl } user { id name } }
  }`,
)

const PanelFollowFragment = graphql(
  `fragment PanelFollow on FollowNotificationNode @_unmask {
    id
    createdAt
    user { id name iconUrl isFollowee }
  }`,
)

const PanelAwardFragment = graphql(
  `fragment PanelAward on WorkAwardNotificationNode @_unmask {
    id
    createdAt
    message
    work { id title enTitle smallThumbnailImageURL }
  }`,
)

export const panelNotificationsQuery = graphql(
  `query PanelNotifications($offset: Int!, $limit: Int!, $where: NotificationsWhereInput) {
    viewer {
      id
      notifications(offset: $offset, limit: $limit, where: $where) {
        __typename
        ... on LikedWorkNotificationNode { ...PanelLiked }
        ... on WorkCommentNotificationNode { ...PanelComment }
        ... on WorkCommentReplyNotificationNode { ...PanelReply }
        ... on FollowNotificationNode { ...PanelFollow }
        ... on WorkAwardNotificationNode { ...PanelAward }
      }
    }
  }`,
  [
    PanelLikedFragment,
    PanelCommentFragment,
    PanelReplyFragment,
    PanelFollowFragment,
    PanelAwardFragment,
  ],
)

export const panelMessagesQuery = graphql(
  `query PanelMessages($limit: Int!) {
    viewer {
      id
      supportMessages(offset: 0, limit: $limit) {
        id
        text
        createdAt
        user { id iconUrl }
      }
    }
  }`,
)
