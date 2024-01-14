import { gql } from "@apollo/client"

export const imageLoraModelsQuery = gql`
  query ImageLoraModels {
    imageLoraModels {
      id
      name
      description
      license
      prompts
      slug
      thumbnailImageURL
    }
  }
`
