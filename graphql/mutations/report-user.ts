import { gql } from "@/graphql/__generated__"

export const reportUserMutation = gql(`
  mutation ReportUser($input: ReportUserInput!) {
    reportUser(input: $input)
  }
`)
