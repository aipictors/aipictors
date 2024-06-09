import { graphql } from "gql.tada"

export const createStickerMutation = graphql(
  `mutation CreateSticker($input: CreateStickerInput!) {
    createSticker(input: $input) {
      id
    }
  }`,
)
