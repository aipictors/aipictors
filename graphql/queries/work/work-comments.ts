import { commentFieldsFragment } from "@/graphql/fragments/comment-fields"
import { gql } from "@apollo/client"

export const workCommentsQuery = gql`
  ${commentFieldsFragment}
  query WorkComments($workId: ID!) {
    work(id: $workId) {
      id
      comments(offset: 0, limit: 128) {
        ...CommentFields
        responses(offset: 0, limit: 128) {
          ...CommentFields
        }
      }
    }
  }
`
