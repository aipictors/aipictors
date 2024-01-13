import {
  PassType,
  useCreatePassCheckoutSessionMutation,
} from "@/__generated__/apollo"
import { PassPlanList } from "@/app/[lang]/(beta)/plus/_components/pass-plan-list"
import { useToast } from "@/components/ui/use-toast"
import { Config } from "@/config"
import { getAnalytics, logEvent } from "firebase/analytics"

export const PlusAbout = () => {
  const [mutation, { loading: isLoading }] =
    useCreatePassCheckoutSessionMutation()

  const { toast } = useToast()

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
        toast({
          description: "セッションの作成に失敗しました。",
        })
        return
      }
      window.location.assign(pageURL)
    } catch (error) {
      if (error instanceof Error) {
        toast({ description: error.message })
      }
    }
  }

  return <PassPlanList onSelect={onSelect} isLoading={isLoading} />
}
