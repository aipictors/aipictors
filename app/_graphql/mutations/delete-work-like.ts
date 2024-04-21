import { gql } from "@/_graphql/__generated__"

export const deleteWorkLikeMutation = gql(`
  mutation DeleteWorkLike($input: DeleteWorkLikeInput!) {
    deleteWorkLike(input: $input) {
      id
      likesCount
      isLiked
    }
  }
`)
