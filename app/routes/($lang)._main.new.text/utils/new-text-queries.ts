import { graphql } from "gql.tada"
import {
  PostTextFormAiModelFragment,
  PostTextFormAlbumFragment,
  PostTextFormPassFragment,
  PostTextFormRecentlyUsedTagsFragment,
} from "~/routes/($lang)._main.new.image/components/post-text-form-input"

export const viewerQuery = graphql(
  `query ViewerQuery(
    $limit: Int!,
    $offset: Int!,
    $ownerUserId: ID
    $generationOffset: Int!,
    $generationLimit: Int!,
    $generationWhere: ImageGenerationResultsWhereInput,
    $startDate: String!,
    $endDate: String!,
    $startAt: String!,
  ) {
    viewer {
      id
      token
      currentPass {
        ...PostTextFormPass
      }
      recentlyUsedTags {
        ...PostTextFormRecentlyUsedTags
      }
      imageGenerationResults(offset: $generationOffset, limit: $generationLimit, where: $generationWhere) {
        id
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
    albums(
      offset: $offset,
      limit: $limit,
      where: {
        ownerUserId: $ownerUserId,
        needInspected: false,
        needsThumbnailImage: false,
      }
    ) {
      ...PostTextFormAlbum
    }
    aiModels(offset: 0, limit: 124, where: {}) {
      id
      ...PostTextFormAiModel
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
    PostTextFormAiModelFragment,
    PostTextFormAlbumFragment,
    PostTextFormPassFragment,
    PostTextFormRecentlyUsedTagsFragment,
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
