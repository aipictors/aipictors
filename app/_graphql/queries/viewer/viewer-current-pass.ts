import { passFieldsFragment } from "@/_graphql/fragments/pass-fields"
import { graphql } from "gql.tada"

export const viewerCurrentPassQuery = graphql(
  `query ViewerCurrentPass {
    viewer {
      user {
        id
        nanoid
        hasSignedImageGenerationTerms
      }
      currentPass {
        ...PassFields
      }
    }
  }`,
  [passFieldsFragment],
)
