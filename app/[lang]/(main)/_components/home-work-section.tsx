import type { WorksQuery } from "@/__generated__/apollo"
import { WorkCard } from "@/app/[lang]/(main)/works/_components/work-card"
import { Button } from "@/components/ui/button"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { QuestionMarkCircledIcon } from "@radix-ui/react-icons"
import Link from "next/link"

type Props = {
  works: NonNullable<WorksQuery["works"]>
  title: string
  tooltip?: string
}

export const HomeWorkSection = (props: Props) => {
  return (
    <section className="space-y-4 pl-4 pr-4 lg:pr-8">
      <div className="flex justify-between">
        <h2 className="items-center space-x-2 text-2xl font-bold">
          {props.title}
          {props.tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <QuestionMarkCircledIcon className="inline h-6 w-auto" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{props.tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </h2>
        <Button variant={"secondary"} size={"sm"}>
          {"すべて見る"}
        </Button>
      </div>
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
      >
        <CarouselContent>
          {props.works.map((work) => (
            <CarouselItem
              key={work.id}
              className="md:basis-1/4 lg:basis-1/5 xl:basis-[12.5%]"
            >
              <Link href={`/works/${work.id}`}>
                <WorkCard
                  imageURL={work.largeThumbnailImageURL}
                  imageWidth={work.largeThumbnailImageWidth}
                  imageHeight={work.largeThumbnailImageHeight}
                />
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </section>
  )
}
