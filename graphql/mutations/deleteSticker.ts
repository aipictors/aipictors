import { gql } from "@apollo/client"

export const DELETE_STICKER = gql`
  mutation DeleteSticker($input: DeleteStickerInput!) {
    deleteSticker(input: $input) {
      id
      title
    }
  }
`
