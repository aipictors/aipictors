import { graphql } from "gql.tada"

// gql.tada は文字列をそのまま読んで型を作るので、項目は各クエリに書く（テンプレートで差し込むと型が付かない）

export const viewerGachaQuery = graphql(
  `query ViewerGacha {
    viewerGacha {
      exchangePoints
      shards
      totalPulls
      freePullsToday
      isPremiumDealAvailable
      selectedHeaderFrameSlug
      ownedPrizes {
        prizeId
        count
      }
    }
  }`,
)

export const drawGachaMutation = graphql(
  `mutation DrawGacha($input: DrawGachaInput!) {
    drawGacha(input: $input) {
      drawId
      costCoins
      pulls {
        prizeId
        isNew
        shards
        byGuarantee
      }
      state {
        exchangePoints
        shards
        totalPulls
        freePullsToday
        isPremiumDealAvailable
        selectedHeaderFrameSlug
        ownedPrizes {
          prizeId
          count
        }
      }
    }
  }`,
)

export const exchangeGachaPrizeMutation = graphql(
  `mutation ExchangeGachaPrize($input: ExchangeGachaPrizeInput!) {
    exchangeGachaPrize(input: $input) {
      exchangePoints
      shards
      totalPulls
      freePullsToday
      isPremiumDealAvailable
      selectedHeaderFrameSlug
      ownedPrizes {
        prizeId
        count
      }
    }
  }`,
)

export const selectGachaHeaderFrameMutation = graphql(
  `mutation SelectGachaHeaderFrame($input: SelectGachaHeaderFrameInput!) {
    selectGachaHeaderFrame(input: $input) {
      exchangePoints
      shards
      totalPulls
      freePullsToday
      isPremiumDealAvailable
      selectedHeaderFrameSlug
      ownedPrizes {
        prizeId
        count
      }
    }
  }`,
)

/** ガチャのアイコン枠を着けるのに、枠の ID を slug から引く（ガチャの枠は持っているものだけ返ってくる） */
export const gachaAvatarFramesQuery = graphql(
  `query GachaAvatarFrames {
    userAvatarFrames {
      id
      slug
      isGachaOnly
    }
    userSetting {
      id
      selectedUserAvatarFrame {
        id
      }
    }
  }`,
)

export const applyGachaAvatarFrameMutation = graphql(
  `mutation ApplyGachaAvatarFrame($input: UpdateUserSettingInput!) {
    updateUserSetting(input: $input) {
      id
      selectedUserAvatarFrame {
        id
      }
    }
  }`,
)
