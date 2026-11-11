import { graphql } from "gql.tada"

export const workArticleFragment = graphql(
  `fragment WorkArticle on WorkNode @_unmask {
    id
    uuid
    isMyRecommended
    title
    mdUrl
    accessType
    type
    adminAccessType
    promptAccessType
    rating
    description
    isCaptionBeforeBody
    isSensitive
    enTitle
    enDescription
    imageURL
    largeThumbnailImageURL
    largeThumbnailImageWidth
    largeThumbnailImageHeight
    smallThumbnailImageURL
    smallThumbnailImageWidth
    smallThumbnailImageHeight
    thumbnailImagePosition
    subWorksCount
    url
    isDeleted
    user {
      id
      biography
      enBiography
      login
      nanoid
      name
      isOfficial
      isModerator
      receivedLikesCount
      receivedViewsCount
      awardsCount
      followersCount
      worksCount
      iconUrl
      avatarFrame {
        id
        frameType
        backgroundStyle
        overlayImageUrl
        borderPadding
      }
      headerImageUrl
      webFcmToken
      isFollower
      isFollowee
      headerImageUrl
      receivedLikesCount
      createdLikesCount
      createdBookmarksCount
      isMuted
      isBlocked
      works(offset: 0, limit: 16, where: { ratings: [G, R15] }) {
        id
        userId
        title
        enTitle
        largeThumbnailImageURL
        largeThumbnailImageWidth
        largeThumbnailImageHeight
        smallThumbnailImageURL
        smallThumbnailImageWidth
        smallThumbnailImageHeight
        thumbnailImagePosition
        subWorksCount
        commentsCount
        isLiked
      }
      promptonUser {
        id
      }
    }
    likedUsers(offset: 0, limit: 48) {
      id
      name
      iconUrl
      login
      avatarFrame {
        id
        frameType
        backgroundStyle
        overlayImageUrl
        borderPadding
      }
    }
    album {
      id
      title
      description
      slug
      user {
        login
      }
    }
    dailyTheme {
      id
      title
      dateText
    }
    tagNames
    createdAt
    likesCount
    viewsCount
    commentsCount
    subWorks {
      id
      imageUrl
    }
    nextWork {
      id
      title
      smallThumbnailImageURL
      smallThumbnailImageWidth
      smallThumbnailImageHeight
      thumbnailImagePosition
    }
    previousWork {
      id
      title
      smallThumbnailImageURL
      smallThumbnailImageWidth
      smallThumbnailImageHeight
      thumbnailImagePosition
    }
    model
    modelHash
    generationModelId
    workModelId
    isTagEditable
    isCommentsEditable
    isLiked
    isBookmarked
    isInCollection
    isPromotion
    isGeneration
    ogpThumbnailImageUrl
    prompt
    negativePrompt
    noise
    seed
    steps
    sampler
    scale
    strength
    vae
    clipSkip
    otherGenerationParams
    pngInfo
    style
    url
    updatedAt
    dailyRanking
    weeklyRanking
    monthlyRanking
    aiDailyRanking {
      rank
      dateText
      periodType
      isSensitive
    }
    aiWeeklyRanking {
      rank
      dateText
      periodType
      isSensitive
    }
    aiMonthlyRanking {
      rank
      dateText
      periodType
      isSensitive
    }
    relatedUrl
    nanoid
    isBotGradingEnabled
    isBotGradingPublic
    botEvaluationStatus
    botEvaluation {
      cutenessScore
      coolnessScore
      beautyScore
      originalityScore
      compositionScore
      colorScore
      detailScore
      consistencyScore
      overallScore
      comment
      personality
    }
  }`,
)

export const sensitiveWorkArticleFragment = graphql(
  `fragment WorkArticle on WorkNode @_unmask {
    id
    uuid
    url
    isMyRecommended
    title
    mdUrl
    accessType
    type
    adminAccessType
    promptAccessType
    rating
    description
    isCaptionBeforeBody
    isSensitive
    enTitle
    enDescription
    imageURL
    largeThumbnailImageURL
    largeThumbnailImageWidth
    largeThumbnailImageHeight
    smallThumbnailImageURL
    smallThumbnailImageWidth
    smallThumbnailImageHeight
    thumbnailImagePosition
    subWorksCount
    isDeleted
    user {
      id
      biography
      enBiography
      login
      nanoid
      name
      isOfficial
      isModerator
      receivedLikesCount
      receivedViewsCount
      awardsCount
      followersCount
      worksCount
      iconUrl
      avatarFrame {
        id
        frameType
        backgroundStyle
        overlayImageUrl
        borderPadding
      }
      headerImageUrl
      webFcmToken
      isFollower
      isFollowee
      headerImageUrl
      receivedLikesCount
      createdLikesCount
      createdBookmarksCount
      isMuted
      isBlocked
      works(offset: 0, limit: 16, where: { ratings: [R18, R18G] }) {
        id
        userId
        title
        enTitle
        largeThumbnailImageURL
        largeThumbnailImageWidth
        largeThumbnailImageHeight
        smallThumbnailImageURL
        smallThumbnailImageWidth
        smallThumbnailImageHeight
        thumbnailImagePosition
        subWorksCount
        commentsCount
        isLiked
      }
      promptonUser {
        id
      }
    }
    likedUsers(offset: 0, limit: 120) {
      id
      name
      iconUrl
      login
      avatarFrame {
        id
        frameType
        backgroundStyle
        overlayImageUrl
        borderPadding
      }
    }
    album {
      id
      title
      description
      slug
      user {
        login
      }
    }
    dailyTheme {
      id
      title
      dateText
    }
    tagNames
    createdAt
    likesCount
    viewsCount
    commentsCount
    subWorks {
      id
      imageUrl
    }
    nextWork {
      id
      title
      smallThumbnailImageURL
      smallThumbnailImageWidth
      smallThumbnailImageHeight
      thumbnailImagePosition
    }
    previousWork {
      id
      title
      smallThumbnailImageURL
      smallThumbnailImageWidth
      smallThumbnailImageHeight
      thumbnailImagePosition
    }
    model
    modelHash
    generationModelId
    workModelId
    isTagEditable
    isCommentsEditable
    isLiked
    isBookmarked
    isInCollection
    aiDailyRanking {
      rank
      dateText
      periodType
      isSensitive
    }
    aiWeeklyRanking {
      rank
      dateText
      periodType
      isSensitive
    }
    aiMonthlyRanking {
      rank
      dateText
      periodType
      isSensitive
    }
    isPromotion
    isGeneration
    ogpThumbnailImageUrl
    prompt
    negativePrompt
    noise
    seed
    steps
    sampler
    scale
    strength
    vae
    clipSkip
    otherGenerationParams
    pngInfo
    style
    url
    updatedAt
    dailyRanking
    weeklyRanking
    monthlyRanking
    relatedUrl
    nanoid
    isPromotion
    isBotGradingEnabled
    isBotGradingPublic
    botEvaluationStatus
    botEvaluation {
      cutenessScore
      coolnessScore
      beautyScore
      originalityScore
      compositionScore
      colorScore
      detailScore
      consistencyScore
      overallScore
      comment
      personality
    }
  }`,
)

export const userSettingFragment = graphql(
  `fragment UserSetting on UserSettingNode @_unmask {
      id
  }`,
)
