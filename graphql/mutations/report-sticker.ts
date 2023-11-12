import { gql } from "@apollo/client"

export default gql`
  mutation ReportSticker($input: ReportStickerInput!) {
    reportSticker(input: $input)
  }
`
