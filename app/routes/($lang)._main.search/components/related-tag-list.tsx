import { TagCard } from "~/routes/($lang)._main.tags._index/components/tag-card"

export function RelatedTagList() {
  return (
    // <div>
    //   <Splide
    //     aria-label="関連タグ"
    //     options={{
    //       rewind: true,
    //       gap: "1rem",
    //       autoWidth: true,
    //       pagination: false,
    //       arrows: false,
    //     }}
    //   >
    //
    //       <TagCard />
    //
    //
    //       <TagCard />
    //
    //
    //       <TagCard />
    //
    //
    //       <TagCard />
    //
    //   </Splide>
    // </div>
    <div>
      <TagCard />
      <TagCard />
      <TagCard />
      <TagCard />
    </div>
  )
}
