import { Card, CardContent } from "@/_components/ui/card"
import { Skeleton } from "@/_components/ui/skeleton"

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
