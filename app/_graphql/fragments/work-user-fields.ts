import { gql } from "@/_graphql/__generated__"

export const workUserFieldsFragment = gql(`
  fragment WorkUserFields on UserNode {
    id
    name
    login
    iconImage {
      id
      downloadURL
    }
  }
`)
