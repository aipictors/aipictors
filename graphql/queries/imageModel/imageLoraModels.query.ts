import { gql } from "@apollo/client"

export const IMAGE_LORA_MODELS = gql`
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
