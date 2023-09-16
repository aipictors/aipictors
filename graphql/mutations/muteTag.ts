import { gql } from "@apollo/client"

export const MUTE_TAG = gql`
  mutation MuteTag($input: MuteTagInput!) {
    muteTag(input: $input) {
      id
      viewer {
        id
        isMuted
      }
    }
  }
`
