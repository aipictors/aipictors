import { gql } from "@apollo/client"

export default gql`
  mutation DeleteSticker($input: DeleteStickerInput!) {
    deleteSticker(input: $input) {
      id
      title
    }
  }
`
