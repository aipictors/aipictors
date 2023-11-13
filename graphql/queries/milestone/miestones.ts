import { gql } from "@apollo/client"

export default gql`
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
