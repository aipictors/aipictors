import {
  PassType,
  useCreatePassCheckoutSessionMutation,
} from "@/__generated__/apollo"
import { PassPlanList } from "@/app/[lang]/(beta)/plus/_components/pass-plan-list"
import { Config } from "@/config"
import { getAnalytics, logEvent } from "firebase/analytics"
import { toast } from "sonner"

export const PlusAbout = () => {
  const [mutation, { loading: isLoading }] =
    useCreatePassCheckoutSessionMutation()

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

  return (
    <div className="space-y-8 pb-8">
      <div className="space-y-2">
        <p className="whitespace-pre-wrap">
          {"Aipictors+に加入してサービス内で特典を受けることができます。"}
        </p>
      </div>
      <PassPlanList onSelect={onSelect} isLoading={isLoading} />
    </div>
  )
}
