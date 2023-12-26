import { gql } from "@apollo/client"
import { nanoid } from "nanoid"

const id = nanoid()

export default gql`
  mutation CreateMessageImage($input: CreateMessageImageInput!) {
    createMessageImage(input: { 
      ...$input,
      id: "${id}"
    }) {
      id
      imageUrl
    }
  }
`
