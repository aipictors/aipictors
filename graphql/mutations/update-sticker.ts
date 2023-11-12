import { gql } from "@apollo/client"

export default gql`
  mutation UpdateSticker($input: UpdateStickerInput!) {
    updateSticker(input: $input) {
      id
      title
    }
  }
`
