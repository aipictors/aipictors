import { graphql } from "gql.tada"

export const muteUserMutation = graphql(
  `mutation MuteUser($input: MuteUserInput!) {
    muteUser(input: $input) {
      id
      isMuted
    }
  }`,
)
