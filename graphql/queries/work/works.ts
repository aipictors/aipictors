import { gql } from "@/graphql/__generated__"

export const worksQuery = gql(`
  query Works($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...PartialWorkFields
    }
  }
`)
