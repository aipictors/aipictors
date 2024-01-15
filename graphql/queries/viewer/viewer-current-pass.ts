import { gql } from "@/graphql/__generated__"
import { passFieldsFragment } from "@/graphql/fragments/pass-fields"

export const viewerCurrentPassQuery = gql(`
  query ViewerCurrentPass {
    viewer {
      currentPass {
        ...PassFields
      }
    }
  }
`)
