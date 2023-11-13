import { gql } from "@apollo/client"

export default gql`
  mutation ReportAlbum($input: ReportAlbumInput!) {
    reportAlbum(input: $input)
  }
`
