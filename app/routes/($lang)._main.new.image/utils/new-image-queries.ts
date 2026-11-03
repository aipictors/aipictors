import { graphql } from "gql.tada"
import {
  PostImageFormAiModelFragment,
  PostImageFormAlbumFragment,
  PostImageFormPassFragment,
  PostImageFormRecentlyUsedTagsFragment,
} from "~/routes/($lang)._main.new.image/components/post-image-form-input"

export const ViewerQuery = graphql(
  `query ViewerQuery(
    $limit: Int!,
    $offset: Int!,
    $withGenerationResults: Boolean!
    $generationOffset: Int!
    $generationLimit: Int!
    $generationWhere: ImageGenerationResultsWhereInput
    $startAt: String
    $startDate: String
    $endDate: String
  ) {
    viewer {
      id
      token
      albums(offset: $offset, limit: $limit) {
        ...PostImageFormAlbum
      }
      currentPass {
        ...PostImageFormPass
      }
      recentlyUsedTags {
        ...PostImageFormRecentlyUsedTags
      }
      imageGenerationResults(offset: $generationOffset, limit: $generationLimit, where: $generationWhere) @include(if: $withGenerationResults) {
        id
        nanoid
        prompt
        negativePrompt
        seed
        steps
        scale
        sampler
        clipSkip
        sizeType
        t2tImageUrl
        t2tMaskImageUrl
        t2tDenoisingStrengthSize
        t2tInpaintingFillSize
        rating
        completedAt
        isProtected
        generationType
        postModelId
        modelHash
        model {
          id
          name
          type
        }
        vae
        nanoid
        status
        estimatedSeconds
        controlNetControlMode
        controlNetEnabled
        controlNetGuidanceEnd
        controlNetGuidanceStart
        controlNetPixelPerfect
        controlNetProcessorRes
        controlNetResizeMode
        controlNetThresholdA
        controlNetThresholdB
        controlNetWeight
        controlNetModule
        controlNetModel
        controlNetSaveDetectedMap
        controlNetHrOption
        upscaleSize
        imageUrl
        thumbnailUrl
      }
    }
    aiModels(offset: 0, limit: 124, where: {}) {
      id
      ...PostImageFormAiModel
    }
    dailyThemes(
      limit: 8,
      offset: 0,
      where: {
        startDate: $startDate,
        endDate: $endDate,
      }) {
      id
      title
      dateText
      note
    }
    appEvents(
      limit: 8,
      offset: 0,
      where: {
        endAt: $startAt,
      }
    ) {
      id
      description
      title
      thumbnailImageUrl
      headerImageUrl
      tag
      slug
      startAt
      endAt
    }
  }`,
  [
    PostImageFormAiModelFragment,
    PostImageFormAlbumFragment,
    PostImageFormPassFragment,
    PostImageFormRecentlyUsedTagsFragment,
  ],
)

export const UserEventsQuery = graphql(
  `query UserEventsQuery($limit: Int!, $offset: Int!, $endAt: String!) {
    userEvents(
      limit: $limit,
      offset: $offset,
      where: {
        endAt: $endAt,
      }
    ) {
      id
      description
      title
      thumbnailImageUrl
      headerImageUrl
      ratings
      tag: mainTag
      slug
      startAt
      endAt
    }
  }`,
)

export const SelectedUserEventQuery = graphql(
  `query SelectedUserEvent($slug: String!) {
    userEvent(slug: $slug) {
      id
      description
      title
      thumbnailImageUrl
      headerImageUrl
      ratings
      tag: mainTag
      slug
      startAt
      endAt
    }
  }`,
)

export const LinkWorkToGenerationsMutation = graphql(
  `mutation LinkWorkToGenerations($workId: ID!, $generationNanoids: [String!]!) {
    linkWorkToGenerations(workId: $workId, generationNanoids: $generationNanoids)
  }`,
)

export const CreateWorkMutation = graphql(
  `mutation CreateWork($input: CreateWorkInput!) {
    createWork(input: $input) {
      id
      title
      accessType
      nanoid
      uuid
    }
  }`,
)

export const WorkByImageHashQuery = graphql(
  `query WorkByImageHash($imageHash: String!) {
    workByImageHash(imageHash: $imageHash) {
      id
      title
      accessType
      nanoid
      uuid
    }
  }`,
)
