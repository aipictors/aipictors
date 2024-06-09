import { graphql } from "gql.tada"

export const muteTagMutation = graphql(
  `mutation MuteTag($input: MuteTagInput!) {
    muteTag(input: $input) {
      id
    }
  }`,
)
