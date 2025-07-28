import { useTranslation } from "~/hooks/use-translation"
import { GenerationConfigContext } from "~/routes/($lang).generation._index/contexts/generation-config-context"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"

/**
 * サイドコンテンツ切替タブ
 */
export function GenerationDemoSideTabsView() {
  const _context = useGenerationContext()

  const { send } = GenerationConfigContext.useActorRef()

  const _state = GenerationConfigContext.useSelector((snap) => {
    return snap.value
  })

  const _t = useTranslation()

  return <>{null}</>
}
