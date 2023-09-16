import { gql } from "@apollo/client"

export const MUTE_USER = gql`
  mutation MuteUser($input: MuteUserInput!) {
    muteUser(input: $input) {
      id
      viewer {
        id
        isMuted
      }
    }
  }
`
