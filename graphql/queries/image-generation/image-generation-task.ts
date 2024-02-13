import { gql } from "@/graphql/__generated__"

/**
 * 画像生成のタスク
 */
export const imageGenerationTaskQuery = gql(`
  query ImageGenerationTask($id: ID!) {
    imageGenerationTask(id: $id) {
      ...ImageGenerationTaskFields
    }
}
`)
