import type { partialWorkFieldsFragment } from "@/_graphql/fragments/partial-work-fields"
import type { FragmentOf } from "gql.tada"
import { RowsPhotoAlbum } from "react-photo-album"
import { UnstableSSR as SSR } from "react-photo-album/ssr"

type Props = {
  works: FragmentOf<typeof partialWorkFieldsFragment>[]
  title: string
}

export const TagWorkSection = (props: Props) => {
  // 各作品のデータを変換
  const photos = props.works.map((work) => ({
    src: work.largeThumbnailImageURL,
    width: work.largeThumbnailImageWidth,
    height: work.largeThumbnailImageHeight,
    workId: work.id, // 各作品のID
  }))

  return (
    <section className="space-y-4">
      <div className="flex justify-between">
        <h2 className="items-center space-x-2 font-bold text-2xl">
          {props.title}
        </h2>
      </div>
      <SSR breakpoints={[300, 600, 900, 1200]}>
        <RowsPhotoAlbum
          photos={photos}
          // renderPhoto={(photoProps) => (
          //   // @ts-ignore 後で考える
          //   <HomeWorkAlbum {...photoProps} workId={photoProps.photo.workId} />
          // )}
          // defaultContainerWidth={1600}
          // sizes={{
          //   size: "calc(100vw - 240px)",
          //   sizes: [{ viewport: "(max-width: 960px)", size: "100vw" }],
          // }}
        />
      </SSR>
    </section>
  )
}
