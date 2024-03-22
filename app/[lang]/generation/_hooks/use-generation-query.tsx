import { GenerationQueryContext } from "@/app/[lang]/generation/_contexts/generation-query-context"
import { useContext } from "react"

export const useGenerationQuery = () => {
  const dataContext = useContext(GenerationQueryContext)

  return dataContext
}
