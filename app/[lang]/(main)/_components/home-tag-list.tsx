"use client"
import { TagButton } from "@/app/[lang]/(main)/_components/tag-button"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import { HotTagsQuery } from "@/graphql/__generated__/graphql"
import Link from "next/link"

type Props = {
  hotTags: HotTagsQuery["hotTags"]
}

/**
 * ホーム上部に
 * @param props
 * @returns
 */
export const HomeTagList = (props: Props) => {
  return (
    <Carousel opts={{ dragFree: true, loop: true }}>
      <CarouselContent>
        {props.hotTags?.map((tag) => (
          <CarouselItem className="basis-auto" key={tag.id}>
            <Link href={`/tags/${tag.name}`}>
              <TagButton name={tag.name} />
            </Link>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  )
}
