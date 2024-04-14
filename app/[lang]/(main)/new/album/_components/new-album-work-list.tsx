import { SelectableWorkCard } from "@/[lang]/(main)/new/album/_components/selectable-work-card"

export const NewAlbumWorkList = () => {
  return (
    // <div>
    //   <Splide
    //     aria-label="投稿済み作品一覧"
    //     options={{
    //       rewind: true,
    //       gap: "1rem",
    //       autoWidth: true,
    //       pagination: false,
    //       arrows: false,
    //     }}
    //   >
    //
    //       <SelectableWorkCard />
    //
    //
    //       <SelectableWorkCard />
    //
    //
    //       <SelectableWorkCard />
    //
    //
    //       <SelectableWorkCard />
    //
    //
    //       <SelectableWorkCard />
    //
    //
    //       <SelectableWorkCard />
    //
    //
    //       <SelectableWorkCard />
    //
    //   </Splide>
    // </div>
    <div>
      <SelectableWorkCard />
      <SelectableWorkCard />
      <SelectableWorkCard />
      <SelectableWorkCard />
      <SelectableWorkCard />
      <SelectableWorkCard />
      <SelectableWorkCard />
    </div>
  )
}
