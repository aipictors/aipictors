import { gql } from "@/_graphql/__generated__"

export const partialUserFieldsFragment = gql(`
  fragment PartialUserFields on UserNode {
    id
    login
    name
    iconImage {
      id
      downloadURL
    }
  }
`)
