import { gql } from "@apollo/client"

export const imageModelQuery = gql`
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
`
