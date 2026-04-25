import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { config } from "~/config"
import { PassPlanList } from "~/routes/($lang)._main.plus._index/components/pass-plan-list"
import { useMutation } from "@apollo/client/index"
import { getAnalytics, logEvent } from "firebase/analytics"
import { graphql } from "gql.tada"
import { toast } from "sonner"

type Props = {
  showUpgradePlansOnly?: boolean
  hideSubmitButton?: boolean
}

export function PlusAbout (props: Props) {
  const [mutation, { loading: isLoading }] = useMutation(
    createPassCheckoutSessionMutation,
  )

  const onSelect = async (passType: IntrospectionEnum<"PassType">) => {
    try {
      logEvent(getAnalytics(), config.logEvent.select_item, {
        item_list_id: passType,
        items: [{ item_id: passType, item_name: passType }],
      })
      const result = await mutation({
        variables: { input: { passType: passType } },
      })
      const pageURL = result.data?.createPassCheckoutSession ?? null
      if (pageURL === null) {
        console.error("Checkout URL is null. Mutation result:", result)
        toast("セッションの作成に失敗しました。")
        return
      }
      // Verify URL is valid before redirect
      if (typeof pageURL !== 'string' || pageURL.length === 0) {
        console.error("Invalid checkout URL:", pageURL)
        toast("セッションURLが無効です。")
        return
      }
      console.log("Redirecting to checkout URL:", pageURL)
      window.location.assign(pageURL)
    } catch (error) {
      if (error instanceof Error) {
        console.error("Checkout error:", error)
        toast(error.message)
      } else {
        console.error("Unknown error:", error)
        toast("エラーが発生しました。")
      }
    }
  }

  return (
    <PassPlanList
      showUpgradePlansOnly={props.showUpgradePlansOnly}
      hideSubmitButton={props.hideSubmitButton}
      onSelect={onSelect}
      isLoading={isLoading}
    />
  )
}

const createPassCheckoutSessionMutation = graphql(
  `mutation CreatePassCheckoutSession($input: CreatePassCheckoutSessionInput!) {
    createPassCheckoutSession(input: $input)
  }`,
)
