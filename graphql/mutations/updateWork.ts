import { gql } from "@apollo/client"

export const UPDATE_WORK = gql`
  mutation UpdateWork($input: UpdateWorkInput!) {
    updateWork(input: $input) {
      id
      title
      description
    }
  }
`
