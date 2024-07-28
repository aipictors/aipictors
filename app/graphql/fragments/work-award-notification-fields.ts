import { partialWorkFieldsFragment } from "@/graphql/fragments/partial-work-fields"
import { graphql } from "gql.tada"

export const workAwardNotificationFieldsFragment = graphql(
  `fragment WorkAwardNotificationFields on WorkAwardNotificationNode @_unmask {
    id
    createdAt
    message
    work {
      ...PartialWorkFields
    }
  }`,
  [partialWorkFieldsFragment],
)
