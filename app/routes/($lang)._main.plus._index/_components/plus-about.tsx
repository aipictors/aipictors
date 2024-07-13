import type { IntrospectionEnum } from "@/_lib/introspection-enum"
import { config } from "@/config"
import { PassPlanList } from "@/routes/($lang)._main.plus._index/_components/pass-plan-list"
import { useMutation } from "@apollo/client/index"
import { getAnalytics, logEvent } from "firebase/analytics"
import { graphql } from "gql.tada"
import { toast } from "sonner"

type Props = {
  showUpgradePlansOnly?: boolean
  hideSubmitButton?: boolean
}

export const PlusAbout = (props: Props) => {
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

const createPassCheckoutSessionMutation = graphql(
  `mutation CreatePassCheckoutSession($input: CreatePassCheckoutSessionInput!) {
    createPassCheckoutSession(input: $input)
  }`,
)
