import { graphql, type FragmentOf } from "gql.tada"
import { RowsPhotoAlbum } from "react-photo-album"
import SSR from "react-photo-album/ssr"
import "react-photo-album/rows.css"
import { Link } from "@remix-run/react"
import { LikeButton } from "~/components/like-button"
import { useRef, useCallback, useEffect, useState } from "react"
import { Badge } from "~/components/ui/badge"
import { Heart } from "lucide-react"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar"

type Props = {
  works: FragmentOf<typeof PhotoAlbumVideoWorkFragment>[]
  targetRowHeight?: number
  isAutoPlay?: boolean
}

/**
 * レスポンシブ対応の作品一覧
 */
export function ResponsivePhotoVideoWorksAlbum(props: Props): React.ReactNode {
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  const [isMobile, setIsMobile] = useState(false)

  const isAutoPlay = props.isAutoPlay ?? true

  // モバイルデバイス判定
  useEffect(() => {
    const checkMobile = () => {
      if (typeof window === "undefined") return false
      return (
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent,
        ) || window.innerWidth < 768
      )
    }
    setIsMobile(checkMobile())
  }, [])

  const handleMouseEnter = useCallback((index: number) => {
    if (isAutoPlay) {
      return
    }
    const video = videoRefs.current[index]
    if (video) {
      video.style.zIndex = "10" // 動画を前面に表示
      video.play() // 動画を再生
    }
  }, [])

  const handleMouseLeave = useCallback((index: number) => {
    if (isAutoPlay) {
      return
    }
    const video = videoRefs.current[index]
    if (video) {
      video.pause() // 動画を停止
      video.style.zIndex = "-1" // 動画を背面に戻す
    }
  }, [])

  if (props.works.length === 1) {
    return (
      <div className="relative transition-all" style={{ position: "relative" }}>
        <div className="relative inline-block h-full w-full">
          <Link
            to={`/posts/${props.works[0].id}`}
            className="max-h-32 overflow-hidden rounded"
            onMouseEnter={() => handleMouseEnter(Number(props.works[0].id))}
            onMouseLeave={() => handleMouseLeave(Number(props.works[0].id))}
          >
            <video
              src={props.works[0].url ?? ""}
              // biome-ignore lint/suspicious/noAssignInExpressions: ref assignment
              ref={(el) => (videoRefs.current[Number(props.works[0].id)] = el)}
              className="absolute top-0 left-0 max-h-72 w-full overflow-hidden rounded object-contain"
              style={
                isAutoPlay || isMobile ? { zIndex: "10" } : { zIndex: "-1" }
              }
              muted
              autoPlay={isAutoPlay || isMobile}
              loop
              playsInline
            >
              <track
                kind="captions"
                src={props.works[0].url ?? ""}
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
  }

  return (
    <SSR breakpoints={[300, 600, 900, 1200]}>
      <RowsPhotoAlbum
        photos={props.works.map((work, _index) => ({
          key: work.id,
          src: work.smallThumbnailImageURL,
          url: work.url,
          width: work.smallThumbnailImageWidth,
          height: work.smallThumbnailImageHeight,
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
                  targetWorkOwnerUserId={photo.context.user?.id ?? ""}
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
                <Link to={`/users/${photo.context.user?.id}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Avatar className="size-4">
                        <AvatarImage
                          className="size-4 rounded-full"
                          src={withIconUrlFallback(photo.context.user?.iconUrl)}
                          alt={photo.context.user?.name}
                        />
                        <AvatarFallback />
                      </Avatar>
                      <span className="block text-nowrap font-bold text-sm ">
                        {photo.context.user?.name}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="flex items-center space-x-1">
                        <Heart className="size-3 fill-gray-400 text-gray-400" />
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
                role={props.role}
                title={props["aria-label"]}
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
                <div className="relative inline-block h-full w-full">
                  <Link
                    to={`/posts/${context.photo.context.id}`}
                    className="overflow-hidden rounded"
                    onMouseEnter={() => handleMouseEnter(context.index)}
                    onMouseLeave={() => handleMouseLeave(context.index)}
                  >
                    <img
                      {...props}
                      alt={props.alt}
                      className="h-full w-full overflow-hidden rounded"
                    />
                    <video
                      src={context.photo.url ?? ""}
                      // biome-ignore lint/suspicious/noAssignInExpressions: ref assignment
                      ref={(el) => (videoRefs.current[context.index] = el)}
                      className="absolute top-0 left-0 w-full overflow-hidden rounded object-contain"
                      style={
                        isAutoPlay || isMobile
                          ? { zIndex: "10" }
                          : { zIndex: "-1" }
                      }
                      muted
                      autoPlay={isAutoPlay || isMobile}
                      loop
                      playsInline
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

export const PhotoAlbumVideoWorkFragment = graphql(
  `fragment PhotoAlbumVideoWork on WorkNode @_unmask {
    id
    title
    url
    smallThumbnailImageHeight
    smallThumbnailImageWidth
    smallThumbnailImageURL
    likesCount
    isLiked
    user {
      id
      name
      iconUrl
    }
  }`,
)
