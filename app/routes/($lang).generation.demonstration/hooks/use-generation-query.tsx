import { GenerationQueryContext } from "~/routes/($lang).generation.demonstration/contexts/generation-query-context"
import { useContext } from "react"

export function useGenerationQuery() {
  const dataContext = useContext(GenerationQueryContext)

  return dataContext
}
