import { gql } from "@apollo/client"

export const IMAGE_MODEL = gql`
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
    }
  }
`
