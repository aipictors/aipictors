import { graphql } from "gql.tada"

export const createWorkLikeMutation = graphql(
  `mutation CreateWorkLike($input: CreateWorkLikeInput!) {
    createWorkLike(input: $input) {
      id
      likesCount
      isLiked
    }
  }`,
)
