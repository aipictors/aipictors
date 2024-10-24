import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "~/components/ui/carousel"
import { TagButton } from "~/routes/($lang)._main._index/components/tag-button"
import { graphql, type FragmentOf } from "gql.tada"

type Props = {
  hotTags: FragmentOf<typeof HomeTagListItemFragment>[]
  themeTitle?: string
}

/**
 * ホーム上部に表示するタグ一覧
 */
export function HomeSensitiveTagList(props: Props) {
  return (
    <Carousel opts={{ dragFree: true, loop: false }}>
      <CarouselContent>
        <CarouselItem className="basis-auto">
          {props.themeTitle && (
            <TagButton
              link={`/r/tags/${props.themeTitle}`}
              name={`今日のお題「${props.themeTitle}」`}
              isTagName={true}
            />
          )}
        </CarouselItem>
        {props.hotTags?.map((tag) => (
          <CarouselItem className="basis-auto" key={tag.id}>
            <TagButton
              link={`/r/tags/${tag.name}`}
              name={tag.name}
              isTagName={true}
            />
          </CarouselItem>
        ))}
        <CarouselItem className="relative w-16 basis-1/3.5 space-y-2" />
      </CarouselContent>
      {/* <div className="absolute top-0 right-0 h-full w-16 bg-gradient-to-r from-transparent to-card" /> */}
    </Carousel>
  )
}

export const HomeTagListItemFragment = graphql(
  `fragment HomeTagListItem on TagNode @_unmask {
    id
    name
  }`,
)
