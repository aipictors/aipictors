import { graphql } from "gql.tada"

export const updateStickerMutation = graphql(
  `mutation UpdateSticker($input: UpdateStickerInput!) {
    updateSticker(input: $input) {
      id
      title
    }
  }`,
)
