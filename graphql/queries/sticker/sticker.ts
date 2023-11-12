import { gql } from "@apollo/client"

export default gql`
  query Sticker($id: ID!) {
    sticker(id: $id) {
      id
      createdAt
      title
      user {
        id
        name
        iconImage {
          id
          downloadURL
        }
      }
      image {
        id
        downloadURL
      }
      downloadsCount
      likesCount
      usesCount
    }
  }
`
