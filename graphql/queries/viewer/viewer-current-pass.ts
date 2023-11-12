import { gql } from "@apollo/client"

export default gql`
  query ViewerCurrentPass {
    viewer {
      currentPass {
        ...PassFields
      }
    }
  }
`
