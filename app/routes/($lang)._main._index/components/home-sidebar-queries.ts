import { graphql } from "gql.tada"
import { HomeNewCommentsFragment } from "~/routes/($lang)._main._index/components/home-new-comments"
import { HomeNewPostedUsersFragment } from "~/routes/($lang)._main._index/components/home-new-users-section"

export const homeSidebarQuery = graphql(
  `query HomeSidebarQuery {
    newPostedUsers: newPostedUsers(
      offset: 0
      limit: 8
    ) {
      ...HomeNewPostedUsers
    }
    newComments: newComments(
      offset: 0
      limit: 8
      where: {
        isSensitive: false
        isTextOnly: true
        ratings: [G, R15]
      }
    ) {
      ...HomeNewComments
    }
  }`,
  [HomeNewPostedUsersFragment, HomeNewCommentsFragment],
)

export const viewerCurrentPassQuery = graphql(`
  query ViewerCurrentPass {
    viewer {
      id
      currentPass {
        id
        type
      }
    }
  }
`)

export const SideMenuAdvertisementsFragment = graphql(`
  fragment SideMenuAdvertisementsFields on CustomerAdvertisementNode @_unmask {
    id
    imageUrl
    url
    displayProbability
    clickCount
    impressionCount
    isSensitive
    createdAt
    page
    startAt
    endAt
    isActive
  }
`)

export const randomCustomerAdvertisementQuery = graphql(
  `query RandomCustomerAdvertisement($where: RandomCustomerAdvertisementWhereInput!) {
    randomCustomerAdvertisement(where: $where) {
      ...SideMenuAdvertisementsFields
    }
  }`,
  [SideMenuAdvertisementsFragment],
)

export const updateClickedCountCustomerAdvertisementMutation = graphql(`
  mutation UpdateClickedCountCustomerAdvertisement($id: ID!) {
    updateClickedCountCustomerAdvertisement(id: $id) {
      id
    }
  }
`)
