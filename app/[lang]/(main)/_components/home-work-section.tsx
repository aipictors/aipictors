import type { WorksQuery } from "@/__generated__/apollo"
import { WorkCard } from "@/app/[lang]/(main)/works/_components/work-card"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { HelpCircle } from "lucide-react"
import Link from "next/link"

type Props = {
  works: NonNullable<WorksQuery["works"]>
  title: string
  tooltip?: string
}

export const HomeWorkSection = (props: Props) => {
  return (
    <section className="flex flex-col space-y-4 pl-4 pr-4 lg:pr-8">
      <div className="flex justify-between">
        <div className="flex items-center space-x-2">
          <h2 className="text-2xl font-bold">{props.title}</h2>
          {props.tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{props.tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <Button variant={"secondary"} size={"sm"}>
          {"すべて見る"}
        </Button>
      </div>
      <div className="grid grid-cols-5 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-2 w-full">
        {props.works.map((work) => (
          <div key={work.id} className="relative">
            <Link href={`/works/${work.id}`}>
              <WorkCard
                imageURL={work.largeThumbnailImageURL}
                imageWith={work.largeThumbnailImageWith}
                imageHeight={work.largeThumbnailImageHeight}
              />
            </Link>
          </div>
        ))}
      </div>
    </section>
  )
}
