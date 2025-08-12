import { LikeButton } from "~/components/like-button"
import { Link } from "@remix-run/react"
import { UserNameBadge } from "~/routes/($lang)._main._index/components/user-name-badge"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"
import { useTranslation } from "~/hooks/use-translation"
import type { PhotoAlbumWorkFragment } from "~/components/responsive-photo-works-album"
import type { FragmentOf } from "gql.tada"
import { Images, MessageCircle } from "lucide-react"
import { WorkMediaBadge } from "~/components/work-media-badge"
import { HoverVideoImage } from "~/components/hover-video-image"

type Props = {
  works: FragmentOf<typeof PhotoAlbumWorkFragment>[]
  isRanking?: boolean
  isShowProfile?: boolean
  hasReferenceButton?: boolean
  onSelect?: (index: string) => void
}

/**
 * クロップ済み作品一覧
 */
export function HomeCroppedWorks(props: Props) {
  const t = useTranslation()

  if (!props.works || props.works.length === 0) {
    return null
  }

  return (
    <>
      <section className="hidden grid-cols-2 gap-4 md:grid md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {props.works
          .filter(
            (work, index, self) =>
              self.findIndex((w) => w.id === work.id) === index,
          )
          .map((work) => (
            <div className="flex flex-col space-y-2" key={work.id}>
              <Link
                to={`/posts/${work.id}`}
                key={work.id}
                className="group relative overflow-hidden rounded-md"
              >
                <div
                  className="w-full overflow-hidden"
                  style={{ paddingBottom: "100%" }}
                >
                  <HoverVideoImage
                    workId={work.id}
                    imageUrl={work.largeThumbnailImageURL}
                    videoUrl={work.url}
                    alt={work.title}
                    className="absolute top-0 left-0 hidden h-full w-full rounded-md object-cover md:block"
                  />
                  <HoverVideoImage
                    workId={work.id}
                    imageUrl={work.smallThumbnailImageURL}
                    videoUrl={work.url}
                    alt={t(
                      work.title,
                      work.enTitle.length > 0 ? work.enTitle : work.title,
                    )}
                    className="absolute top-0 left-0 block h-full w-full rounded-md object-cover md:hidden"
                  />
                  <div className="absolute right-2 bottom-2">
                    <LikeButton
                      size={56}
                      targetWorkId={work.id}
                      targetWorkOwnerUserId={work.user?.id ?? ""}
                      defaultLiked={work.isLiked}
                      defaultLikedCount={0}
                      isBackgroundNone={true}
                      strokeWidth={2}
                      isParticle={true}
                    />
                  </div>
                </div>
              </Link>
              <p className="max-w-40 overflow-hidden text-ellipsis text-nowrap font-bold text-md">
                {t(
                  work.title,
                  work.enTitle.length > 0 ? work.enTitle : work.title,
                )}
              </p>
              {work.user && (
                <UserNameBadge
                  userId={work.user.id}
                  userIconImageURL={withIconUrlFallback(work.user.iconUrl)}
                  name={work.user.name}
                  width={"lg"}
                  likesCount={work.likesCount}
                />
              )}
            </div>
          ))}
      </section>
      <section className="safari-work-grid grid grid-cols-2 gap-2 md:hidden md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {props.works
          .filter(
            (work, index, self) =>
              self.findIndex((w) => w.id === work.id) === index,
          )
          .map((work) => (
            <div key={work.id} className="relative w-full">
              {props.onSelect ? (
                <button
                  type="button"
                  onClick={() => props.onSelect?.(work.id)}
                  className="group relative w-full overflow-hidden border-none bg-transparent p-0"
                >
                  <div
                    className="w-full overflow-hidden"
                    style={{ paddingBottom: "100%" }}
                  >
                    <HoverVideoImage
                      workId={work.id}
                      imageUrl={work.smallThumbnailImageURL}
                      videoUrl={work.url}
                      alt={work.title}
                      className="absolute top-0 left-0 block h-full w-full rounded-md object-cover"
                    />
                    <div className="absolute right-2 bottom-2">
                      <LikeButton
                        size={56}
                        targetWorkId={work.id}
                        targetWorkOwnerUserId={work.user?.id ?? ""}
                        defaultLiked={work.isLiked}
                        defaultLikedCount={0}
                        isBackgroundNone={true}
                        strokeWidth={2}
                        isParticle={true}
                      />
                    </div>
                    {work.subWorksCount > 0 && (
                      <div className="absolute top-1 right-1 z-10 flex items-center space-x-1 rounded-xl bg-zinc-800 bg-opacity-50 p-1 px-2">
                        <Images className="size-3 text-white" />
                        <div className="font-bold text-white text-xs">
                          {work.subWorksCount + 1}
                        </div>
                      </div>
                    )}
                    {work.commentsCount > 0 && (
                      <div className="absolute top-1 left-1 z-10 flex items-center space-x-1 rounded-xl bg-zinc-800 bg-opacity-50 p-1 px-2">
                        <MessageCircle className="size-3 text-white" />
                        <div className="font-bold text-white text-xs">
                          {work.commentsCount}
                        </div>
                      </div>
                    )}
                    {/* プロンプト公開・動画バッジ */}
                    <div
                      className={`absolute left-1 z-10 ${props.hasReferenceButton ? "bottom-8" : "bottom-2"}`}
                    >
                      <WorkMediaBadge
                        isPromptPublic={work.promptAccessType === "PUBLIC"}
                        hasVideoUrl={Boolean(work.url)}
                        isGeneration={work.isGeneration}
                        hasReferenceButton={props.hasReferenceButton}
                        size="sm"
                      />
                    </div>
                  </div>
                </button>
              ) : (
                <Link
                  to={`/posts/${work.id}`}
                  className="relative block w-full overflow-hidden"
                >
                  <div
                    className="relative w-full overflow-hidden"
                    style={{
                      paddingBottom: "100%",
                    }}
                  >
                    <HoverVideoImage
                      workId={work.id}
                      imageUrl={work.smallThumbnailImageURL}
                      videoUrl={work.url}
                      alt={work.title}
                      className="absolute top-0 left-0 block h-full w-full rounded-md object-cover"
                    />
                    <div className="absolute right-2 bottom-2">
                      <LikeButton
                        size={56}
                        targetWorkId={work.id}
                        targetWorkOwnerUserId={work.user?.id ?? ""}
                        defaultLiked={work.isLiked}
                        defaultLikedCount={0}
                        isBackgroundNone={true}
                        strokeWidth={2}
                        isParticle={true}
                      />
                    </div>
                    {work.subWorksCount > 0 && (
                      <div className="absolute top-1 right-1 z-10 flex items-center space-x-1 rounded-xl bg-zinc-800 bg-opacity-50 p-1 px-2">
                        <Images className="size-3 text-white" />
                        <div className="font-bold text-white text-xs">
                          {work.subWorksCount + 1}
                        </div>
                      </div>
                    )}
                    {work.commentsCount > 0 && (
                      <div className="absolute top-1 left-1 z-10 flex items-center space-x-1 rounded-xl bg-zinc-800 bg-opacity-50 p-1 px-2">
                        <MessageCircle className="size-3 text-white" />
                        <div className="font-bold text-white text-xs">
                          {work.commentsCount}
                        </div>
                      </div>
                    )}
                    {/* プロンプト公開・動画バッジ */}
                    <div
                      className={`absolute left-1 z-10 ${props.hasReferenceButton ? "bottom-8" : "bottom-2"}`}
                    >
                      <WorkMediaBadge
                        isPromptPublic={work.promptAccessType === "PUBLIC"}
                        hasVideoUrl={Boolean(work.url)}
                        isGeneration={work.isGeneration}
                        hasReferenceButton={props.hasReferenceButton}
                        size="sm"
                      />
                    </div>
                  </div>
                </Link>
              )}
              {work.user && props.isShowProfile && (
                <>
                  <p className="overflow-hidden text-ellipsis text-nowrap font-bold text-md">
                    {work.title}
                  </p>
                  <UserNameBadge
                    userId={work.user.id}
                    userIconImageURL={withIconUrlFallback(work.user.iconUrl)}
                    name={work.user.name}
                    width={"md"}
                    likesCount={work.likesCount}
                  />
                </>
              )}
            </div>
          ))}
      </section>
    </>
  )
}
