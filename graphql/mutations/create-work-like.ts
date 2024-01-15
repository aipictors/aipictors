import { gql } from "@apollo/client"

export const createWorkLikeMutation = gql`
  mutation CreateWorkLike($input: CreateWorkLikeInput!) {
    createWorkLike(input: $input) {
      id
      likesCount
      isLiked
    }
  }
`
