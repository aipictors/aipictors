import { gql } from "@apollo/client"

export const createStickerMutation = gql`
  mutation CreateSticker($input: CreateStickerInput!) {
    createSticker(input: $input) {
      id
      title
    }
  }
`
