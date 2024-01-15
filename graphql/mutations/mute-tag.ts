import { gql } from "@/graphql/__generated__"

export const muteTagMutation = gql(`
  mutation MuteTag($input: MuteTagInput!) {
    muteTag(input: $input) {
      id
      isMuted
    }
  }
`)
