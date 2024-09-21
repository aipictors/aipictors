import { Button } from "~/components/ui/button"
import { GenerationViewCard } from "~/routes/($lang).generation._index/components/generation-view-card"
import { GenerationTaskDetails } from "~/routes/($lang).generation._index/components/task-view/generation-task-details"
import { GenerationConfigContext } from "~/routes/($lang).generation._index/contexts/generation-config-context"
import { useTranslation } from "~/hooks/use-translation"

/**
 * 生成履歴詳細
 */
export function GenerationTaskDetailsView() {
  const { send } = GenerationConfigContext.useActorRef()
  const t = useTranslation()

  const onCancel = () => {
    send({ type: "CLOSE_PREVIEW" })
  }

  return (
    <GenerationViewCard
      title={t("履歴詳細", "History Details")}
      tooltip={t(
        "履歴に関する操作が可能です",
        "You can manage history-related actions",
      )}
    >
      <Button className="mx-4 my-2" variant={"secondary"} onClick={onCancel}>
        {t("閉じる", "Close")}
        <span className="hidden md:inline-block">
          {t("（Escape）", "(Escape)")}
        </span>
      </Button>

      <GenerationTaskDetails />
    </GenerationViewCard>
  )
}
