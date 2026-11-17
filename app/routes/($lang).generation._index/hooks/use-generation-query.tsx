import { useContext } from "react"
import { GenerationQueryContext } from "~/routes/($lang).generation._index/contexts/generation-query-context"

export function useGenerationQuery() {
  const dataContext = useContext(GenerationQueryContext)

  return dataContext
}
