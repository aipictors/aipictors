import { gql } from "@apollo/client"

export const muteTagMutation = gql`
  mutation MuteTag($input: MuteTagInput!) {
    muteTag(input: $input) {
      id
      isMuted
    }
  }
`
