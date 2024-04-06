import { gql } from "@/_graphql/__generated__"

export const updateStickerMutation = gql(`
  mutation UpdateSticker($input: UpdateStickerInput!) {
    updateSticker(input: $input) {
      id
      title
    }
  }
`)
