import { gql } from "@apollo/client"

export const IMAGE_MODELS = gql`
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
