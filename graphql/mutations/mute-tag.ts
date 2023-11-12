import { gql } from "@apollo/client"

export default gql`
  mutation MuteTag($input: MuteTagInput!) {
    muteTag(input: $input) {
      id
      isMuted
    }
  }
`
