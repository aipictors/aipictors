import {} from "~/components/ui/tabs"
import { useTranslation } from "~/hooks/use-translation"
import { GenerationConfigContext } from "~/routes/($lang).generation._index/contexts/generation-config-context"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"

/**
 * サイドコンテンツ切替タブ
 */
export function GenerationDemoSideTabsView() {
  const context = useGenerationContext()

  const { send } = GenerationConfigContext.useActorRef()

  const state = GenerationConfigContext.useSelector((snap) => {
    return snap.value
  })

  const t = useTranslation()

  return <>{null}</>
}
