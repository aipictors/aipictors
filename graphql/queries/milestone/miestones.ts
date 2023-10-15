import { gql } from "@apollo/client"

export const MILESTONES = gql`
  query Milestones($repository: String!) {
    milestones(where: {repository: $repository}) {
      id
      title
      version
      description
      pageURL
      isDone
    }
  }
`
