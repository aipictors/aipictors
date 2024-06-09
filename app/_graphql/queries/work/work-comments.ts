import { commentFieldsFragment } from "@/_graphql/fragments/comment-fields"
import { graphql } from "gql.tada"

export const workCommentsQuery = graphql(
  `query WorkComments($workId: ID!) {
    work(id: $workId) {
      id
      comments(offset: 0, limit: 128) {
        ...CommentFields
        responses(offset: 0, limit: 128) {
          ...CommentFields
        }
      }
    }
  }`,
  [commentFieldsFragment],
)
