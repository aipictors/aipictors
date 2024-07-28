import type { partialWorkFieldsFragment } from "@/_graphql/fragments/partial-work-fields"
import type { FragmentOf } from "gql.tada"
import { RowsPhotoAlbum } from "react-photo-album"
import { UnstableSSR as SSR } from "react-photo-album/ssr"

type Props = {
  works: FragmentOf<typeof partialWorkFieldsFragment>[]
}

/**
 * レスポンシブ対応の作品一覧
 */
export const ResponsivePhotoVideoWorksAlbum = (props: Props) => {
  if (props.works === null || props.works.length === 0) {
    return null
  }

  const photos = props.works.map((work) => ({
    src: work.largeThumbnailImageURL,
    width: work.largeThumbnailImageWidth,
    height: work.largeThumbnailImageHeight,
    workId: work.id, // 各作品のID
    userId: work.user.id, // 作品の所有者のID
    userIcon:
      work.user?.iconUrl ??
      "https://pub-c8b482e79e9f4e7ab4fc35d3eb5ecda8.r2.dev/no-profile.jpg", // 作品の所有者のアイコン
    userName: work.user.name, // 作品の所有者の名前
    workOwnerUserId: work.user.id,
    isLiked: work.isLiked,
    title: work.title,
    url: work.url ?? "",
  }))

  return (
    <SSR breakpoints={[300, 600, 900, 1200]}>
      <RowsPhotoAlbum
        photos={photos}
        // renderPhoto={(photoProps) => (
        //   // @ts-ignore 後で考える
        //   <HomeWorkVideoAlbum
        //     {...photoProps}
        //     userId={photoProps.photo.userId}
        //     userName={photoProps.photo.userName}
        //     userIcon={photoProps.photo.userIcon}
        //     workId={photoProps.photo.workId}
        //     workOwnerUserId={photoProps.photo.workOwnerUserId}
        //     isLiked={photoProps.photo.isLiked}
        //     workTitle={photoProps.photo.title}
        //     url={photoProps.photo.url}
        //   />
        // )}
        // defaultContainerWidth={640}
        // targetRowHeight={240}
        // sizes={{
        //   size: "calc(100vw - 240px)",
        //   sizes: [{ viewport: "(max-width: 960px)", size: "100vw" }],
        // }}
      />
    </SSR>
  )
}
