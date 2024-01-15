import { gql } from "@apollo/client"

export const deleteStickerMutation = gql`
  mutation DeleteSticker($input: DeleteStickerInput!) {
    deleteSticker(input: $input) {
      id
      title
    }
  }
`
