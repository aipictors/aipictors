import { gql } from "@/graphql/__generated__"

export const createWorkLikeMutation = gql(`
  mutation CreateWorkLike($input: CreateWorkLikeInput!) {
    createWorkLike(input: $input) {
      id
      likesCount
      isLiked
    }
  }
`)
