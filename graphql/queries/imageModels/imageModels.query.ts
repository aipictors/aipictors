import { gql } from "@apollo/client"

export const ImageModels = gql`
  query ImageModels {
    imageModels {
      id
      name
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
