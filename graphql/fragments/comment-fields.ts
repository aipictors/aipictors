import { workUserFieldsFragment } from "@/graphql/fragments/work-user-fields"
import { gql } from "@apollo/client"

export const commentFieldsFragment = gql`
  ${workUserFieldsFragment}
  fragment CommentFields on CommentNode {
    id
    createdAt
    text
    user {
      ...WorkUserFields
    }
    sticker {
      id
      image {
        id
        downloadURL
      }
    }
  }
`
