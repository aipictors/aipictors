import { gql } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { CommentListItemFragment } from "~/routes/($lang)._main.posts.$post._index/components/work-comment-list"

export const viewerQuery = gql`
  query AdminWorksViewer {
    viewer {
      id
      isModerator
    }
  }
`

export const adminWorksQuery = gql`
  query AdminWorks($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    works(offset: $offset, limit: $limit, where: $where) {
      id
      title
      description
      type
      accessType
      adminAccessType
      isDeleted
      createdAt
      likesCount
      commentsCount
      subWorksCount
      imageURL
      isCommentsEditable
      isLiked
      isSensitive
      smallThumbnailImageURL
      subWorks {
        id
        imageUrl
      }
      user {
        id
        name
        login
        iconUrl
        isBlocked
      }
    }
    worksCount(where: $where)
  }
`

export const adminWorkDetailQuery = gql`
  query AdminWorkDetail($id: ID!) {
    work(id: $id) {
      id
      type
      url
      mdUrl
      imageURL
      subWorks {
        id
        imageUrl
      }
    }
  }
`

export const adminWorkCommentsQuery = graphql(
  `query AdminWorkComments($workId: ID!) {
    work(id: $workId) {
      id
      comments(offset: 0, limit: 128) {
        ...Comment
      }
    }
  }`,
  [CommentListItemFragment],
)

export const changeWorkAccessTypeMutation = gql`
  mutation AdminChangeWorkAccessType($input: WorkSettingsWithAdminInput!) {
    changeWorkSettingsWithAdmin(input: $input)
  }
`

export const createModeratorMessageMutation = gql`
  mutation AdminCreateModeratorMessage($input: CreateMessageInput!) {
    createMessage(input: $input) {
      id
    }
  }
`
