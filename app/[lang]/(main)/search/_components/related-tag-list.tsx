import { TagCard } from "@/[lang]/(main)/tags/_components/tag-card"

export const RelatedTagList = () => {
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
