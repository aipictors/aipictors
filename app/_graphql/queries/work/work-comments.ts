import { gql } from "@/_graphql/__generated__"

export const workCommentsQuery = gql(`
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
`)
