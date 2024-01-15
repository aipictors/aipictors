import { passFieldsFragment } from "@/graphql/fragments/pass-fields"
import { gql } from "@apollo/client"

export const viewerCurrentPassQuery = gql`
  ${passFieldsFragment}
  query ViewerCurrentPass {
    viewer {
      currentPass {
        ...PassFields
      }
    }
  }
`
