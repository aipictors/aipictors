import { gql } from "@/graphql/__generated__"

export const reportAlbumMutation = gql(`
  mutation ReportAlbum($input: ReportAlbumInput!) {
    reportAlbum(input: $input)
  }
`)
