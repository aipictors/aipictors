import type { partialWorkFieldsFragment } from "@/_graphql/fragments/partial-work-fields"
import type { FragmentOf } from "gql.tada"
import { RowsPhotoAlbum } from "react-photo-album"
import { UnstableSSR as SSR } from "react-photo-album/ssr"
import "react-photo-album/rows.css"
import { IconUrl } from "@/_components/icon-url"
import { HomeWorkAlbum } from "@/routes/($lang)._main._index/_components/home-work-album"

type Props = {
  works: FragmentOf<typeof partialWorkFieldsFragment>[]
  targetRowHeight?: number
  direction?: "rows" | "columns"
}

/**
 * レスポンシブ対応の作品一覧
 */
export const ResponsivePhotoWorksAlbum = (props: Props) => {
  return (
    <SSR breakpoints={[300, 600, 900, 1200]}>
      <RowsPhotoAlbum
        photos={props.works.map((work) => ({
          src: work.largeThumbnailImageURL,
          width: work.largeThumbnailImageWidth,
          height: work.largeThumbnailImageHeight,
          workId: work.id, // 各作品のID
          userId: work.user.id, // 作品の所有者のID
          userIcon: IconUrl(work.user?.iconUrl), // 作品の所有者のアイコン
          userName: work.user.name, // 作品の所有者の名前
          workOwnerUserId: work.user.id,
          isLiked: work.isLiked,
          title: work.title,
          isSensitive: work.rating === "R18" || work.rating === "R18G",
          subWorksCount: work.subWorksCount,
        }))}
        targetRowHeight={
          props.targetRowHeight !== undefined ? props.targetRowHeight : 240
        }
        sizes={{
          size: "calc(100vw - 240px)",
          sizes: [{ viewport: "(max-width: 960px)", size: "100vw" }],
        }}
        // componentsProps={{
        //   image: ({ photo }) => (
        //     <HomeWorkAlbum
        //       {...photo}
        //       subWorksCount={photo.subWorksCount}
        //       isMosaic={photo.isSensitive}
        //       userId={photo.userId}
        //       userName={photo.userName}
        //       userIcon={photo.userIcon}
        //       workId={photo.workId}
        //       workOwnerUserId={photo.workOwnerUserId}
        //       isLiked={photo.isLiked}
        //       workTitle={photo.title}
        //     />
        //   ),
        // }}
        render={{
          photo: (_, { photo, index }) => (
            <HomeWorkAlbum
              {...photo}
              subWorksCount={photo.subWorksCount}
              isMosaic={photo.isSensitive}
              userId={photo.userId}
              userName={photo.userName}
              userIcon={photo.userIcon}
              workId={photo.workId}
              workOwnerUserId={photo.workOwnerUserId}
              isLiked={photo.isLiked}
              workTitle={photo.title}
            />
          ),
        }}
      />
    </SSR>
  )
}
