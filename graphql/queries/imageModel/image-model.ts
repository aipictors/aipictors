import { gql } from "@apollo/client"

export default gql`
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
