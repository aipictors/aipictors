import { gql } from "@/graphql/__generated__"

export const imageModelQuery = gql(`
  query ImageModel($id: ID!) {
    imageModel(id: $id) {
      id
      name
      displayName
      category
      description
      license
      prompts
      slug
      style
      thumbnailImageURL
      type
    }
  }
`)
