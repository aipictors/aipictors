import { graphql } from "gql.tada"

export const reportAlbumMutation = graphql(
  `mutation ReportAlbum($input: ReportAlbumInput!) {
    reportAlbum(input: $input)
  }`,
)
