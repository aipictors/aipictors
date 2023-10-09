import { gql } from "@apollo/client"

export const ImageLoraModels = gql`
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
