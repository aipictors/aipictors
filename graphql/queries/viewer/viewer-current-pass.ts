import { gql } from "@/graphql/__generated__"

export const viewerCurrentPassQuery = gql(`
  query ViewerCurrentPass {
    viewer {
      currentPass {
        ...PassFields
      }
    }
  }
`)
