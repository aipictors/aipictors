import { gql } from "@apollo/client"

export const updateUserProfileMutation = gql`
  mutation UpdateUserProfile($input: UpdateUserProfileInput!) {
    updateUserProfile(input: $input) {
      id
      name
    }
  }
`
