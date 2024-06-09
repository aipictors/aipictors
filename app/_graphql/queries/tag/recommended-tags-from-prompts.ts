import { partialTagFieldsFragment } from "@/_graphql/fragments/partial-tag-fields"
import { graphql } from "gql.tada"

export const recommendedTagsFromPromptsQuery = graphql(
  `query RecommendedTagsFromPrompts($prompts: String!) {
    recommendedTagsFromPrompts(prompts: $prompts) {
      ...PartialTagFields
    }
  }`,
  [partialTagFieldsFragment],
)
