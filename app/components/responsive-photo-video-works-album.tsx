import type { FragmentOf } from "gql.tada"
import { RowsPhotoAlbum } from "react-photo-album"
import { UnstableSSR as SSR } from "react-photo-album/ssr"
import "react-photo-album/rows.css"
import type { partialWorkFieldsFragment } from "~/graphql/fragments/partial-work-fields"
import { IconUrl } from "~/components/icon-url"
import { Link } from "@remix-run/react"
import { LikeButton } from "~/components/like-button"
import { useRef, useCallback } from "react"
import { Badge } from "~/components/ui/badge"
import { Heart } from "lucide-react"

type Props = {
  works: FragmentOf<typeof partialWorkFieldsFragment>[]
  targetRowHeight?: number
}

/**
 * レスポンシブ対応の作品一覧
 */
export const ResponsivePhotoVideoWorksAlbum = (props: Props) => {
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])

  const handleMouseEnter = useCallback((index: number) => {
    const video = videoRefs.current[index]
    if (video) {
      video.style.zIndex = "10" // 動画を前面に表示
      video.play() // 動画を再生
    }
  }, [])

  const handleMouseLeave = useCallback((index: number) => {
    const video = videoRefs.current[index]
    if (video) {
      video.pause() // 動画を停止
      video.style.zIndex = "-1" // 動画を背面に戻す
    }
  }, [])

  return (
    <SSR breakpoints={[300, 600, 900, 1200]}>
      <RowsPhotoAlbum
        photos={props.works.map((work, index) => ({
          key: work.id,
          src: work.smallThumbnailImageURL,
          url: work.url,
          width: work.smallThumbnailImageWidth,
          height: work.smallThumbnailImageHeight,
          // workId: work.id,
          // userId: work.user.id,
          // userIcon: IconUrl(work.user?.iconUrl),
          // userName: work.user.name,
          // workOwnerUserId: work.user.id,
          // isLiked: work.isLiked,
          // title: work.title,
          // isSensitive: work.rating === "R18" || work.rating === "R18G",
          // subWorksCount: work.subWorksCount,
          // to: `/posts/${work.id}`,
          // href: `/posts/${work.id}`,
          // likesCount: work.likesCount,
          context: work,
        }))}
        targetRowHeight={
          props.targetRowHeight !== undefined ? props.targetRowHeight : 240
        }
        sizes={{
          size: "calc(100vw - 240px)",
          sizes: [{ viewport: "(max-width: 960px)", size: "100vw" }],
        }}
        render={{
          extras: (_, { photo, index }) => (
            <div key={index}>
              <div className="absolute right-1 bottom-12 z-10">
                <LikeButton
                  size={56}
                  targetWorkId={photo.context.id}
                  targetWorkOwnerUserId={photo.context.user.id}
                  defaultLiked={photo.context.isLiked}
                  defaultLikedCount={0}
                  isBackgroundNone={true}
                  strokeWidth={2}
                  likedCount={photo.context.likesCount}
                />
              </div>
              <div className="mt-2 flex flex-col space-y-2 overflow-hidden text-ellipsis">
                <Link
                  className="w-48 font-bold"
                  to={`/posts/${photo.context.id}`}
                >
                  <p className="overflow-hidden text-ellipsis text-nowrap text-xs">
                    {photo.context.title}
                  </p>
                </Link>
                <Link to={`/users/${photo.context.user.id}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <img
                        src={IconUrl(photo.context.user.iconUrl)}
                        alt={photo.context.user.name}
                        className="h-4 w-4 rounded-full"
                      />
                      <span className="block text-nowrap font-bold text-sm ">
                        {photo.context.user.name}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="flex items-center space-x-1">
                        <Heart className="h-3 w-3 fill-gray-400 text-gray-400" />
                        <span className="text-xs">
                          {photo.context.likesCount}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          ),
          link(props) {
            return (
              <div
                style={props.style}
                className={props.className}
                aria-label={props["aria-label"]}
                role={props.role}
              >
                {props.children}
              </div>
            )
          },
          image(props, context) {
            return (
              <div
                className="relative transition-all"
                style={{ position: "relative" }}
              >
                <div
                  className="relative inline-block"
                  onMouseEnter={() => handleMouseEnter(context.index)}
                  onMouseLeave={() => handleMouseLeave(context.index)}
                >
                  <Link
                    to={`/posts/${context.photo.context.id}`}
                    className="overflow-hidden rounded"
                  >
                    <img
                      {...props}
                      alt={props.alt}
                      className="overflow-hidden rounded"
                    />
                    <video
                      src={context.photo.url ?? ""}
                      // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
                      ref={(el) => (videoRefs.current[context.index] = el)}
                      className="absolute top-0 left-0 overflow-hidden rounded"
                      style={{ zIndex: "-1" }}
                      muted
                    >
                      <track
                        kind="captions"
                        src={context.photo.url ?? ""}
                        label="English"
                      />
                    </video>
                    <div className="absolute top-1 left-1 opacity-50">
                      <Badge variant={"secondary"} className="text-xs">
                        {"video"}
                      </Badge>
                    </div>
                  </Link>
                </div>
              </div>
            )
          },
        }}
      />
    </SSR>
  )
}
