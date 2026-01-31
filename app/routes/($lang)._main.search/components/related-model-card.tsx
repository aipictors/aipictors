import { Button } from "~/components/ui/button"
import { Skeleton } from "~/components/ui/skeleton"

export function RelatedModelCard () {
  return (
    <Button>
      <Skeleton className="h-4 w-16" />
    </Button>
  )
}
