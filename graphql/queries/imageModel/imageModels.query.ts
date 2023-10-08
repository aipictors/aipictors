import { gql } from "@apollo/client"

export const ImageModels = gql`
  query ImageModels {
    imageModels {
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
