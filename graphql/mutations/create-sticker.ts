import { gql } from "@apollo/client"

export default gql`
  mutation CreateSticker($input: CreateStickerInput!) {
    createSticker(input: $input) {
      id
      title
    }
  }
`
