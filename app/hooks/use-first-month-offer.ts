import { useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { useContext } from "react"
import { AuthContext } from "~/contexts/auth-context"

/**
 * はじめてプランに入る人の初月半額（決済のときに aipictors-api が判定してクーポンを付ける）
 * 画面では、ログインしていない人と、一度もプランに入ったことがない人に案内する
 */
export const FIRST_MONTH_DISCOUNT_RATE = 0.5

export function useFirstMonthOffer() {
  const authContext = useContext(AuthContext)

  const { data } = useQuery(viewerFirstMonthOfferQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
  })

  if (authContext.isNotLoggedIn) return true

  if (!data?.viewer) return false

  return (
    data.viewer.isExistedPreviousPass === false &&
    data.viewer.currentPass === null
  )
}

/**
 * 初月の料金（円・切り上げ）
 */
export const toFirstMonthPrice = (price: number) =>
  Math.ceil(price * (1 - FIRST_MONTH_DISCOUNT_RATE))

const viewerFirstMonthOfferQuery = graphql(
  `query ViewerFirstMonthOffer {
    viewer {
      id
      isExistedPreviousPass
      currentPass {
        id
      }
    }
  }`,
)
