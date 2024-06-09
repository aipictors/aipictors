import { aiModelFieldsFragment } from "@/_graphql/fragments/ai-model-fields"
import { graphql } from "gql.tada"

export const aiModelsQuery = graphql(
  `query AiModels($offset: Int!, $limit: Int!, $where: AiModelWhereInput) {
    aiModels(offset: $offset, limit: $limit, where: $where) {
      ...AiModelFields
    }
  }`,
  [aiModelFieldsFragment],
)
