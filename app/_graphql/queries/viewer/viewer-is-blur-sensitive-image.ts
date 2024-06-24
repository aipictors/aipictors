import { graphql } from "gql.tada"

/**
 * センシティブ画像をぼかすかどうか
 */
export const viewerIsBlurSensitiveImageQuery = graphql(
  `query ViewerIsBlurSensitiveImage {
    viewer {
      isBlurSensitiveImage
    }
  }`,
)
