import { gql } from "@/_graphql/__generated__"

export const createUserStickerMutation = gql(`
  mutation CreateUserSticker($input: CreateUserStickerInput!) {
    createUserSticker(input: $input) {
      id
    }
  }
`)
