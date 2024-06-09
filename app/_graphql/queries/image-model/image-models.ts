import { graphql } from "gql.tada"

export const imageModelsQuery = graphql(
  `query ImageModels {
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
  }`,
)
