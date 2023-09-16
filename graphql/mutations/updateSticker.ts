import { gql } from "@apollo/client"

export const UPDATE_STICKER = gql`
  mutation UpdateSticker($input: UpdateStickerInput!) {
    updateSticker(input: $input) {
      id
      title
    }
  }
`
