import { PassPlanList } from "@/app/[lang]/(beta)/plus/_components/pass-plan-list"
import { Config } from "@/config"
import {
  CreatePassCheckoutSessionMutation,
  CreatePassCheckoutSessionMutationVariables,
  PassType,
} from "@/graphql/__generated__/graphql"
import { createPassCheckoutSessionMutation } from "@/graphql/mutations/create-pass-checkout-session"
import { useMutation } from "@apollo/client"
import { getAnalytics, logEvent } from "firebase/analytics"
import { toast } from "sonner"

export const PlusAbout = () => {
  const [mutation, { loading: isLoading }] = useMutation(
    createPassCheckoutSessionMutation,
  )

  const onSelect = async (passType: PassType) => {
    try {
      logEvent(getAnalytics(), Config.logEvent.select_item, {
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

  return <PassPlanList onSelect={onSelect} isLoading={isLoading} />
}
