import { gql } from "@apollo/client"

export const CREATE_WORK = gql`
  mutation CreateWork($input: CreateWorkInput!) {
    createWork(input: $input) {
      title
    }
  }
`
