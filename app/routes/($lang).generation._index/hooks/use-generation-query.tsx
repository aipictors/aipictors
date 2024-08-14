import { GenerationQueryContext } from "~/routes/($lang).generation._index/contexts/generation-query-context"
import { useContext } from "react"

export function useGenerationQuery() {
  const dataContext = useContext(GenerationQueryContext)

  return dataContext
}
