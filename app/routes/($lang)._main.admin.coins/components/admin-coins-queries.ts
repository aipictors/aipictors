import { gql } from "@apollo/client/index"

export const viewerQuery = gql`
  query AdminCoinsViewer {
    viewer {
      id
      isModerator
    }
  }
`

export const adminAdjustCoinsMutation = gql`
  mutation AdminAdjustCoins(
    $targetScope: String!
    $planType: String
    $userIds: [ID!]
    $freeDelta: Int
    $premiumDelta: Int
    $expiresAt: Int
  ) {
    adminAdjustCoins(
      targetScope: $targetScope
      planType: $planType
      userIds: $userIds
      freeDelta: $freeDelta
      premiumDelta: $premiumDelta
      expiresAt: $expiresAt
    ) {
      targetCount
      changedCount
      freeGrantedTotal
      premiumGrantedTotal
      freeReducedTotal
      premiumReducedTotal
    }
  }
`

export const adminCoinOperationHistoriesQuery = gql`
  query AdminCoinOperationHistories($offset: Int!, $limit: Int!) {
    adminCoinOperationHistories(offset: $offset, limit: $limit) {
      id
      createdAt
      moderatorUserId
      targetScope
      planType
      targetUserIds
      targetCount
      changedCount
      freeDelta
      premiumDelta
      freeGrantedTotal
      premiumGrantedTotal
      freeReducedTotal
      premiumReducedTotal
      expiresAt
    }
    adminCoinOperationHistoriesCount
  }
`
