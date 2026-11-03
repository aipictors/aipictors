import { graphql } from "gql.tada"

export const ViewerTokenQuery = graphql(
  `query ViewerTokenQuery {
    viewer {
      id
      token
    }
  }`,
)

export const viewerCurrentPassQuery = graphql(
  `query ViewerCurrentPass {
    viewer {
      id
      currentPass {
        id
        type
      }
      isExistedPreviousPass
    }
  }`,
)

export const viewerLineUserIdQuery = graphql(
  `query viewerLineUserId {
    viewer {
      id
      lineUserId
    }
  }`,
)

export const viewerUserQuery = graphql(
  `query ViewerUser {
    viewer {
      id
      user {
        id
        generatedCount
      }
    }
  }`,
)

export const createImageGenerationTaskReservedMutation = graphql(
  `mutation CreateReservedImageGenerationTask($input: CreateReservedImageGenerationTaskInput!) {
    createReservedImageGenerationTask(input: $input) {
      id
    }
  }`,
)

export const createImageGenerationTaskMutation = graphql(
  `mutation CreateImageGenerationTask($input: CreateImageGenerationTaskInput!) {
    createImageGenerationTask(input: $input) {
      id
    }
  }`,
)

export const createFluxImageGenerationTaskMutation = graphql(
  `mutation CreateFluxImageGenerationTask($input: CreateFluxImageGenerationTaskInput!) {
    createFluxImageGenerationTask(input: $input) {
      id
    }
  }`,
)

export const createGeminiImageGenerationTaskMutation = graphql(
  `mutation CreateGeminiImageGenerationTask($input: CreateGeminiImageGenerationTaskInput!) {
    createGeminiImageGenerationTask(input: $input) {
      id
      nanoid
      status
    }
  }`,
)

export const signImageGenerationTermsMutation = graphql(
  `mutation SignImageGenerationTerms($input: SignImageGenerationTermsInput!) {
    signImageGenerationTerms(input: $input) {
      id
    }
  }`,
)
