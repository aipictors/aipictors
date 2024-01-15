import { gql } from "@apollo/client"

export const reportAlbumMutation = gql`
  mutation ReportAlbum($input: ReportAlbumInput!) {
    reportAlbum(input: $input)
  }
`
