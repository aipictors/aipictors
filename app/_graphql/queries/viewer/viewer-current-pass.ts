import { gql } from "@/_graphql/__generated__"

export const viewerCurrentPassQuery = gql(`
  query ViewerCurrentPass {
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
  }
`)
