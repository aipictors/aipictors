import { gql } from "@apollo/client"

export default gql`
  query Albums($offset: Int!, $limit: Int!, $where: AlbumsWhereInput) {
    albums(offset: $offset, limit: $limit, where: $where) {
      ...PartialAlbumFields
      user {
        ...PartialUserFields
      }
    }
  }
`
