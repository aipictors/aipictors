import { graphql } from "gql.tada"

export const controlNetCategoriesQuery = graphql(
  `query ControlNetCategories {
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
  }`,
)
