import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/_components/ui/carousel"
import { partialTagFieldsFragment } from "@/_graphql/fragments/partial-tag-fields"
import { partialWorkFieldsFragment } from "@/_graphql/fragments/partial-work-fields"
import { TagButton } from "@/routes/($lang)._main._index/_components/tag-button"
import { graphql, type ResultOf } from "gql.tada"

type Props = {
  hotTags: ResultOf<typeof hotTagsQuery>["hotTags"]
  themeTitle?: string
}

/**
 * ホーム上部に表示するタグ一覧
 */
export const HomeTagList = (props: Props) => {
  return (
    <Carousel opts={{ dragFree: true, loop: false }}>
      <CarouselContent>
        <CarouselItem className="basis-auto">
          {props.themeTitle && (
            <TagButton
              link={`${props.themeTitle}`}
              name={`今日のお題「${props.themeTitle}」`}
            />
          )}
        </CarouselItem>

        {props.hotTags?.map((tag) => (
          <CarouselItem className="basis-auto" key={tag.id}>
            <TagButton link={`${tag.name}`} name={tag.name} />
          </CarouselItem>
        ))}
        <CarouselItem className="relative w-16 basis-1/3.5 space-y-2" />
      </CarouselContent>
      <div className="absolute top-0 right-0 h-full w-16 bg-gradient-to-r from-transparent to-white dark:to-black" />
    </Carousel>
  )
}

export const hotTagsQuery = graphql(
  `query HotTags {
    hotTags {
      ...PartialTagFields
      firstWork {
        ...PartialWorkFields
      }
    }
  }`,
  [partialTagFieldsFragment, partialWorkFieldsFragment],
)
