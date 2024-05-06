import { gql } from "@/_graphql/__generated__"

export const controlNetCategoriesQuery = gql(`
  query ControlNetCategories {
    controlNetCategories {
      id
      name
      enName
      contents {
        id
        name
        enName
        module
        sizeKind
        imageUrl
        thumbnailImageUrl
      }
    }
  }
`)
