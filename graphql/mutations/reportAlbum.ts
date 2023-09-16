import { gql } from "@apollo/client"

export const REPORT_ALBUM = gql`
  mutation ReportAlbum($input: ReportAlbumInput!) {
    reportAlbum(input: $input)
  }
`
