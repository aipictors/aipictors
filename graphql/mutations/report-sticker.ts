import { gql } from "@apollo/client"

export const reportStickerMutation = gql`
  mutation ReportSticker($input: ReportStickerInput!) {
    reportSticker(input: $input)
  }
`
