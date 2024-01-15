import { gql } from "@/graphql/__generated__"

export const deleteStickerMutation = gql(`
  mutation DeleteSticker($input: DeleteStickerInput!) {
    deleteSticker(input: $input) {
      id
      title
    }
  }
`)
