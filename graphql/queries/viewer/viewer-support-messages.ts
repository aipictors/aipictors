import { gql } from "@/graphql/__generated__"

export const viewerSupportMessagesQuery = gql(`
  query ViewerSupportMessages($offset: Int!, $limit: Int!) {
    viewer {
      supportMessages(offset: $offset, limit: $limit) {
        ...MessageFields
      }
    }
  }
`)
