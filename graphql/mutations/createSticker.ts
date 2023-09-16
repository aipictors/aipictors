import { gql } from "@apollo/client"

export const CREATE_STICKER = gql`
  mutation CreateSticker($input: CreateStickerInput!) {
    createSticker(input: $input) {
      id
      title
    }
  }
`
