import { graphql } from "gql.tada"

export const feedWorkFieldsFragment = graphql(
  `fragment FeedWorkFields on WorkNode @_unmask {
    id
    title
    description
    imageURL
    user {
      id
      name
      login
      iconUrl
    }
    createdAt
    likesCount
    viewsCount
  }`,
)
