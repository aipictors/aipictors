import { gql } from "@apollo/client"

export default gql`
  fragment MessageThreadFields on MessageThreadNode {
    id
    updatedAt
    recipient {
      ...PartialUserFields
    }
    latestMessage {
      ...MessageFields
      user {
        ...PartialUserFields
      }
    }
  }
`
