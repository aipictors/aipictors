import { gql } from "@apollo/client"

export default gql`
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
