import { PassPlanList } from "@/app/[lang]/(main)/plus/_components/pass-plan-list"
import { config } from "@/config"
import type { PassType } from "@/graphql/__generated__/graphql"
import { createPassCheckoutSessionMutation } from "@/graphql/mutations/create-pass-checkout-session"
import { useMutation } from "@apollo/client"
import { getAnalytics, logEvent } from "firebase/analytics"
import { toast } from "sonner"

type Props = {
  showUpgradePlansOnly?: boolean
  hideSubmitButton?: boolean
}

export const PlusAbout = (props: Props) => {
  const [mutation, { loading: isLoading }] = useMutation(
    createPassCheckoutSessionMutation,
  )

  const onSelect = async (passType: PassType) => {
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
        toast("セッションの作成に失敗しました。")
        return
      }
      window.location.assign(pageURL)
    } catch (error) {
      if (error instanceof Error) {
        toast(error.message)
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
