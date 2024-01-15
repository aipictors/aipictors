import { gql } from "@/graphql/__generated__"

export const imageLoraModelsQuery = gql(`
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
`)
