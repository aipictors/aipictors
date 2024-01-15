import { gql } from "@/graphql/__generated__"

export const imageModelsQuery = gql(`
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
`)
