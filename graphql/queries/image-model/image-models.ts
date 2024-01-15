import { gql } from "@apollo/client"

export const imageModelsQuery = gql`
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
      type
    }
  }
`
