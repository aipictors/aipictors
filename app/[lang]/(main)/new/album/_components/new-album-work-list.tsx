"use client"

import { SelectableWorkCard } from "@/app/[lang]/(main)/new/album/_components/selectable-work-card"

import { Splide, SplideSlide } from "@splidejs/react-splide"

export const NewAlbumWorkList = () => {
  return (
    <div>
      <Splide
        aria-label="投稿済み作品一覧"
        options={{
          rewind: true,
          gap: "1rem",
          autoWidth: true,
          pagination: false,
          arrows: false,
        }}
      >
        <SplideSlide className={"w-40"}>
          <SelectableWorkCard />
        </SplideSlide>
        <SplideSlide className={"w-40"}>
          <SelectableWorkCard />
        </SplideSlide>
        <SplideSlide className={"w-40"}>
          <SelectableWorkCard />
        </SplideSlide>
        <SplideSlide className={"w-40"}>
          <SelectableWorkCard />
        </SplideSlide>
        <SplideSlide className={"w-40"}>
          <SelectableWorkCard />
        </SplideSlide>
        <SplideSlide className={"w-40"}>
          <SelectableWorkCard />
        </SplideSlide>
        <SplideSlide className={"w-40"}>
          <SelectableWorkCard />
        </SplideSlide>
      </Splide>
    </div>
  )
}
