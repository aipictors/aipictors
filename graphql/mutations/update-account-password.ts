import { gql } from "@/graphql/__generated__"

export const updateAccountPasswordMutation = gql(`
  mutation UpdateAccountPassword($input: UpdateAccountPasswordInput!) {
    updateAccountPassword(input: $input) {
      id
    }
  }
`)
