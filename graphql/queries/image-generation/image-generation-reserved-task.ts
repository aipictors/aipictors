import { gql } from "@/graphql/__generated__"

/**
 * 予約画像生成のタスク
 */
export const imageGenerationReservedTaskQuery = gql(`
  query ImageGenerationReservedTask($id: ID!) {
    imageGenerationReservedTask(id: $id) {
      ...ImageGenerationTaskFields
    }
}
`)
