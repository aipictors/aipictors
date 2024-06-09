import { graphql } from "gql.tada"

export const reportStickerMutation = graphql(
  `mutation ReportSticker($input: ReportStickerInput!) {
    reportSticker(input: $input)
  }`,
)
