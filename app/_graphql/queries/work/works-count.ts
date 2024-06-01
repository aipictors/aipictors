import { gql } from "@/_graphql/__generated__"

export const worksCountQuery = gql(`
  query WorksCount($where: WorksWhereInput) {
    worksCount(where: $where)
  }
`)
