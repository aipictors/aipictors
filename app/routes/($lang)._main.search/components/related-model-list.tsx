import { RelatedModelCard } from "~/routes/($lang)._main.search/components/related-model-card"

export function RelatedModelList() {
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
