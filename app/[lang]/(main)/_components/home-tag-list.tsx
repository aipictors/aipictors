"use client"

import type { HotTagsQuery } from "@/__generated__/apollo"
import { TagButton } from "@/app/[lang]/(main)/_components/tag-button"
import { Config } from "@/config"
import { Splide, SplideSlide } from "@splidejs/react-splide"
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
    <section>
      <Splide
        className="pl-8"
        options={{
          ...Config.splideDefaultOptions,
          rewind: true,
          autoWidth: true,
          pagination: false,
          arrows: false,
        }}
      >
        {props.hotTags?.map((tag) => (
          <SplideSlide key={tag.id}>
            <Link href={`/tags/${tag.name}`} passHref>
              <TagButton name={tag.name} />
            </Link>
          </SplideSlide>
        ))}
      </Splide>
    </section>
  )
}
