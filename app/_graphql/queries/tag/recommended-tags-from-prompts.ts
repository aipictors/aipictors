import { gql } from "@/_graphql/__generated__"

export const recommendedTagsFromPromptsQuery = gql(`
  query RecommendedTagsFromPrompts($prompts: String!) {
    recommendedTagsFromPrompts(prompts: $prompts) {
      ...PartialTagFields
      isLiked
      isWatched
      isMuted
    }
  }
`)
