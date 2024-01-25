import { gql } from "@/graphql/__generated__"

export const imageGenerationTaskQuery = gql(`
query ImageGenerationTask($id: ID!) {
  imageGenerationTask(id: $id) {
    ...ImageGenerationTaskFields
  }
}
`)
