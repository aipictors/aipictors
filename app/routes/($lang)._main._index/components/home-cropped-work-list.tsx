// LikeButton は CroppedWorkSquare 内部での表示に統合されたため未使用

import { Link } from "@remix-run/react"
import { type FragmentOf, graphql } from "gql.tada"
import { CroppedWorkSquare } from "~/components/cropped-work-square"
import { useTranslation } from "~/hooks/use-translation"
import { UserNameBadge } from "~/routes/($lang)._main._index/components/user-name-badge"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"

type Props = {
  works: FragmentOf<typeof HomeCoppedWorkFragment>[]
  isRanking?: boolean
  isShowProfile?: boolean
  onSelect?: (index: string) => void
}

/**
 * クロップ済み作品一覧
 */
export function HomeCroppedWorkList(props: Props) {
  const t = useTranslation()

  if (!props.works || props.works.length === 0) {
    return null
  }

  return (
    <>
      <section className="hidden grid-cols-2 gap-3 md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
        {props.works
          .filter(
            (work, index, self) =>
              self.findIndex((w) => w.id === work.id) === index,
          )
          .map((work) => {
            const content = (
              <CroppedWorkSquare
                workId={work.id}
                imageUrl={work.smallThumbnailImageURL}
                thumbnailImagePosition={work.thumbnailImagePosition ?? 0}
                size="lg"
                imageWidth={work.smallThumbnailImageWidth}
                imageHeight={work.smallThumbnailImageHeight}
                subWorksCount={work.subWorksCount}
                commentsCount={work.commentsCount}
                isPromptPublic={false}
                hasVideoUrl={false}
                isGeneration={false}
                hasReferenceButton={false}
              />
            )

            return (
              <div className="flex min-w-0 flex-col space-y-2" key={work.id}>
                {props.onSelect ? (
                  <button
                    type="button"
                    onClick={() => props.onSelect?.(work.id)}
                    className="group relative w-full overflow-hidden rounded-md border-none bg-transparent p-0"
                  >
                    <div className="w-full">{content}</div>
                  </button>
                ) : (
                  <Link
                    to={`/posts/${work.id}`}
                    className="group relative block w-full overflow-hidden rounded-md"
                  >
                    <div className="w-full">{content}</div>
                  </Link>
                )}
                <p className="overflow-hidden text-ellipsis text-nowrap font-bold text-md">
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
                    width={"sm"}
                    likesCount={work.likesCount}
                  />
                )}
              </div>
            )
          })}
      </section>
      <section className="grid grid-cols-2 gap-2 md:hidden md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {props.works
          .filter(
            (work, index, self) =>
              self.findIndex((w) => w.id === work.id) === index,
          )
          .map((work) => (
            <div key={work.id} className="relative">
              <Link
                to={`/posts/${work.id}`}
                className="relative overflow-hidden"
              >
                <CroppedWorkSquare
                  workId={work.id}
                  imageUrl={work.smallThumbnailImageURL}
                  thumbnailImagePosition={work.thumbnailImagePosition ?? 0}
                  size="lg"
                  imageWidth={work.smallThumbnailImageWidth}
                  imageHeight={work.smallThumbnailImageHeight}
                  subWorksCount={work.subWorksCount}
                  commentsCount={work.commentsCount}
                  isPromptPublic={false}
                  hasVideoUrl={false}
                  isGeneration={false}
                  hasReferenceButton={false}
                />
              </Link>
              {work.user && props.isShowProfile && (
                <>
                  <p className="overflow-hidden text-ellipsis text-nowrap font-bold text-md">
                    {work.title}
                  </p>
                  <UserNameBadge
                    userId={work.user.id}
                    userIconImageURL={withIconUrlFallback(work.user.iconUrl)}
                    name={work.user.name}
                    width={"sm"}
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

export const HomeCoppedWorkFragment = graphql(
  `fragment HomeCoppedWork on WorkNode @_unmask {
    id
    title
    enTitle
    likesCount
    isLiked
    smallThumbnailImageURL
    smallThumbnailImageHeight
    smallThumbnailImageWidth
    largeThumbnailImageURL
    largeThumbnailImageHeight
    largeThumbnailImageWidth
    thumbnailImagePosition
    subWorksCount
    commentsCount
    user {
      id
      name
      iconUrl
    }
  }`,
)
