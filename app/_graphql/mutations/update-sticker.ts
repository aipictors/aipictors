import { graphql } from "gql.tada"

export const updateStickerMutation = graphql(
  `mutation updateSticker($input: UpdateStickerInput!) {
    updateSticker(input: $input) {
      id
    }
  }`,
)
