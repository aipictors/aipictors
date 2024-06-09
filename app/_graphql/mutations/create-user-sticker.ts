import { graphql } from "gql.tada"

export const createUserStickerMutation = graphql(
  `mutation CreateUserSticker($input: CreateUserStickerInput!) {
    createUserSticker(input: $input) {
      id
    }
  }`,
)
