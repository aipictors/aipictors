import { gql } from "@/_graphql/__generated__"

export const reportStickerMutation = gql(`
  mutation ReportSticker($input: ReportStickerInput!) {
    reportSticker(input: $input)
  }
`)
