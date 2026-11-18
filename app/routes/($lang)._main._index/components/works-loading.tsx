import { Loader2Icon } from "lucide-react"

interface Props {
  loading: boolean
  hasWorks?: boolean
}

export function WorksLoading({ loading }: Props) {
  if (!loading) return null

  return (
    <div className="flex justify-center py-8">
      <Loader2Icon className="size-8 animate-spin text-border" />
    </div>
  )
}
