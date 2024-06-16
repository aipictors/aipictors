import { graphql } from "gql.tada"

export const changeUserStickerAccessTypeMutation = graphql(
  `mutation ChangeUserStickerAccessType($input: ChangeUserStickerAccessTypeInput!) {
    changeUserStickerAccessType(input: $input) {
      id
    }
  }`,
)
