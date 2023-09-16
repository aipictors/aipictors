import { gql } from "@apollo/client"

export const REPORT_STICKER = gql`
  mutation ReportSticker($input: ReportStickerInput!) {
    reportSticker(input: $input)
  }
`
