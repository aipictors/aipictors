import { Card, CardContent } from "~/components/ui/card"
import { Skeleton } from "~/components/ui/skeleton"

export const TagCard = () => {
  return (
    <Card>
      <CardContent>
        <div className="flex flex-col">
          <Skeleton className={"h-16"} />
          <Skeleton className={"h-4"} />
        </div>
      </CardContent>
    </Card>
  )
}
