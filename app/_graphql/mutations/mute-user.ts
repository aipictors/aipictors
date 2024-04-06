import { gql } from "@/_graphql/__generated__"

export const muteUserMutation = gql(`
  mutation MuteUser($input: MuteUserInput!) {
    muteUser(input: $input) {
      id
      isMuted
    }
  }
`)
