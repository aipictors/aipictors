import { graphql } from "gql.tada"

export const deleteStickerMutation = graphql(
  `mutation DeleteSticker($input: DeleteStickerInput!) {
    deleteSticker(input: $input) {
      id
      title
    }
  }`,
)
