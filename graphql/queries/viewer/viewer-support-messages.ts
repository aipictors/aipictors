import { gql } from "@/graphql/__generated__"
import { messageFieldsFragment } from "@/graphql/fragments/message-fields"

export const viewerSupportMessagesQuery = gql(`
  query ViewerSupportMessages($offset: Int!, $limit: Int!) {
    viewer {
      supportMessages(offset: $offset, limit: $limit) {
        ...MessageFields
      }
    }
  }
`)
