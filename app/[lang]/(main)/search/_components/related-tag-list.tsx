"use client"

import { TagCard } from "@/app/[lang]/(main)/tags/_components/tag-card"
import { Splide, SplideSlide } from "@splidejs/react-splide"

export const RelatedTagList = () => {
  return (
    <div>
      <Splide
        aria-label="関連タグ"
        options={{
          rewind: true,
          gap: "1rem",
          autoWidth: true,
          pagination: false,
          arrows: false,
        }}
      >
        <SplideSlide className={"w-40"}>
          <TagCard />
        </SplideSlide>
        <SplideSlide className={"w-40"}>
          <TagCard />
        </SplideSlide>
        <SplideSlide className={"w-40"}>
          <TagCard />
        </SplideSlide>
        <SplideSlide className={"w-40"}>
          <TagCard />
        </SplideSlide>
      </Splide>
    </div>
  )
}
