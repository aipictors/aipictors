import { gql } from "@/graphql/__generated__"

export const viewerMessageThreadsQuery = gql(`
  query ViewerMessageThreads($offset: Int!, $limit: Int!) {
    viewer {
      messageThreads(offset: $offset, limit: $limit) {
        ...MessageThreadFields
      }
    }
  }
`)
