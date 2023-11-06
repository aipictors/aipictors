import { gql } from "@apollo/client"

export const CREATE_WORK_LIKE = gql`
  mutation CreateWorkLike($input: CreateWorkLikeInput!) {
    createWorkLike(input: $input) {
      id
      likesCount
      isLiked
    }
  }
`
