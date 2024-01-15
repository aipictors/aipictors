"use client"

import { RelatedModelCard } from "@/app/[lang]/(main)/search/_components/related-model-card"

export const RelatedModelList = () => {
  return (
    // <div>
    //   <Splide
    //     aria-label="関連モデル"
    //     options={{
    //       rewind: true,
    //       gap: "1rem",
    //       autoWidth: true,
    //       pagination: false,
    //       arrows: false,
    //     }}
    //   >
    //     <SplideSlide className={"w-40"}>
    //       <RelatedModelCard />
    //     </SplideSlide>
    //     <SplideSlide className={"w-40"}>
    //       <RelatedModelCard />
    //     </SplideSlide>
    //   </Splide>
    // </div>

    <div>
      <RelatedModelCard />
      <RelatedModelCard />
    </div>
  )
}
