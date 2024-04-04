import { gql } from "@/graphql/__generated__"

export const milestonesQuery = gql(`
  query Milestones($repository: String!) {
    milestones(where: {repository: $repository}) {
      id
      title
      version
      description
      pageURL
      isDone
      dueDate
    }
  }
`)
