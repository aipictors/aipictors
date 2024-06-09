import { graphql } from "gql.tada"

export const milestonesQuery = graphql(
  `query Milestones($repository: String!) {
    milestones(where: {repository: $repository}) {
      id
      title
      version
      description
      pageURL
      isDone
      dueDate
    }
  }`,
)
