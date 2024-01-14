import { messageFieldsFragment } from "@/graphql/fragments/message-fields"
import { gql } from "@apollo/client"

export const viewerSupportMessagesQuery = gql`
  ${messageFieldsFragment}
  query ViewerSupportMessages($offset: Int!, $limit: Int!) {
    viewer {
      supportMessages(offset: $offset, limit: $limit) {
        ...MessageFields
      }
    }
  }
`
