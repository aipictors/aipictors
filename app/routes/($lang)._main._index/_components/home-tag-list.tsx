import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/_components/ui/carousel"
import type { HotTagsQuery } from "@/_graphql/__generated__/graphql"
import { dailyThemeQuery } from "@/_graphql/queries/daily-theme/daily-theme"
import { TagButton } from "@/routes/($lang)._main._index/_components/tag-button"
import { useSuspenseQuery } from "@apollo/client/index"
import { useState } from "react"

type Props = {
  hotTags: HotTagsQuery["hotTags"]
}

/**
 * ホーム上部に表示するタグ一覧
 */
export const HomeTagList = (props: Props) => {
  // const plugin = React.useRef(
  //   Autoplay({ delay: 2000, stopOnInteraction: true }),
  // )

  const [date, setDate] = useState(new Date())

  const { data: worksResp } = useSuspenseQuery(dailyThemeQuery, {
    variables: {
      year: date.getFullYear(),
      month: date.getMonth() + 1, // getMonth()は0から始まるので、1を足す
      day: date.getDate(), // getDate()は月の日にちを返す
      offset: 0,
      limit: 0,
    },
    fetchPolicy: "cache-first",
  })

  const theme = worksResp?.dailyTheme?.title ?? ""

  const themeId = worksResp?.dailyTheme?.id ?? ""

  return (
    <Carousel
      opts={{ dragFree: true, loop: false }}
      // plugins={[plugin.current]}
      // onMouseEnter={plugin.current.stop}
      // onMouseLeave={plugin.current.reset}
    >
      <CarouselContent>
        <CarouselItem className="basis-auto" key={8888}>
          {theme && <TagButton name={`今日のお題「${theme}」`} />}
        </CarouselItem>

        {props.hotTags?.map((tag) => (
          <CarouselItem className="basis-auto" key={tag.id}>
            <TagButton name={tag.name} />
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  )
}
