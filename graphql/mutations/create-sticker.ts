import { gql } from "@/graphql/__generated__"

export const createStickerMutation = gql(`
  mutation CreateSticker($input: CreateStickerInput!) {
    createSticker(input: $input) {
      id
      title
    }
  }
`)
