import { graphql } from "gql.tada"

export const deleteUserStickerMutation = graphql(
  `mutation DeleteUserSticker($input: DeleteUserStickerInput!) {
    deleteUserSticker(input: $input) {
      id
    }
  }`,
)
