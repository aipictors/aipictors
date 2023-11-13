import { gql } from "@apollo/client"

export default gql`
  mutation MuteUser($input: MuteUserInput!) {
    muteUser(input: $input) {
      id
      isMuted
    }
  }
`
