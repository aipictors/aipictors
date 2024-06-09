import { graphql } from "gql.tada"

export const imageLoraModelsQuery = graphql(
  `query ImageLoraModels {
    imageLoraModels {
      id
      name
      description
      license
      prompts
      slug
      thumbnailImageURL
      genre
    }
  }`,
)
