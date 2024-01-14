import { gql } from "@apollo/client"

export const updateStickerMutation = gql`
  mutation UpdateSticker($input: UpdateStickerInput!) {
    updateSticker(input: $input) {
      id
      title
    }
  }
`
