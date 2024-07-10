import { partialTagFieldsFragment } from "@/_graphql/fragments/partial-tag-fields"
import { partialWorkFieldsFragment } from "@/_graphql/fragments/partial-work-fields"
import { graphql } from "gql.tada"

export const homeQuery = graphql(
  `query HomeQuery(
    $after: String
    $year: Int
    $month: Int
    $day: Int
  ) {
    adWorks: works(
      offset: 0,
      limit: 54,
      where: {
        isFeatured: true,
        ratings: [G],
      }
    ) {
      ...PartialWorkFields
    }
    works: works(
      offset: 0,
      limit: 80,
      where: {
        orderBy: LIKES_COUNT,
        sort: DESC,
        createdAtAfter: $after,
        ratings: [G],
      },
    ) {
      ...PartialWorkFields
    }
    imageGenerationWorks: works(
      offset: 0,
      limit: 54,
      where: {
        isRecommended: true,
        ratings: [G],
      },
    ) {
      ...PartialWorkFields
    }
    dailyTheme(year: $year, month: $month, day: $day) {
      id
      title
      dateText
      year
      month
      day
      worksCount,
      works(offset: 0, limit: 0) {
        ...PartialWorkFields
      }
    }
    hotTags {
      ...PartialTagFields
      firstWork {
        ...PartialWorkFields
      }
    }
  }`,
  [partialTagFieldsFragment, partialWorkFieldsFragment],
)
