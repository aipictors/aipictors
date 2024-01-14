import { gql } from "@apollo/client"

export const muteUserMutation = gql`
  mutation MuteUser($input: MuteUserInput!) {
    muteUser(input: $input) {
      id
      isMuted
    }
  }
`
