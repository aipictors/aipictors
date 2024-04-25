import { gql } from "@/_graphql/__generated__"

export const aiModelsQuery = gql(`
  query AiModels($offset: Int!, $limit: Int!, $where: AiModelWhereInput) {
    aiModels(offset: $offset, limit: $limit, where: $where) {
      ...AiModelFields
    }
  }
`)
