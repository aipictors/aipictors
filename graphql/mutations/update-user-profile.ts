import { gql } from "@/graphql/__generated__"

export const updateUserProfileMutation = gql(`
  mutation UpdateUserProfile($input: UpdateUserProfileInput!) {
    updateUserProfile(input: $input) {
      id
      name
    }
  }
`)
