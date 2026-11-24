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

/** UUR（世界で 1 人だけが持てる景品）と持ち主（ログインなしで読める） */
export const gachaUniquePrizesQuery = graphql(
  `query GachaUniquePrizes {
    gachaUniquePrizes {
      prizeId
      slug
      name
      imageUrl
      isClaimed
      claimedAt
      isOwnerWithdrawn
      owner {
        id
        login
        name
        iconUrl
      }
    }
  }`,
)

/** いまの提供割合（UUR の残り数で変わる） */
export const gachaRatesQuery = graphql(
  `query GachaRates {
    gachaRates {
      remainingUniquePrizes
      totalUniquePrizes
      uniquePrizeRate
      rarityRates {
        rarity
        normal
        guaranteed
      }
    }
    gachaUniquePrizes {
      prizeId
      isClaimed
    }
  }`,
)
