import { LikeButton } from "~/components/like-button"
import { Link } from "@remix-run/react"
import { UserNameBadge } from "~/routes/($lang)._main._index/components/user-name-badge"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"
import { useTranslation } from "~/hooks/use-translation"
import type { PhotoAlbumWorkFragment } from "~/components/responsive-photo-works-album"
import type { FragmentOf } from "gql.tada"

type Props = {
  works: FragmentOf<typeof PhotoAlbumWorkFragment>[]
  isRanking?: boolean
  isShowProfile?: boolean
}

/**
 * クロップ済み作品一覧
 */
export function HomeCroppedWorks(props: Props) {
  if (!props.works || props.works.length === 0) {
    return null
  }

  const t = useTranslation()

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
                  <img
                    src={work.largeThumbnailImageURL}
                    alt={work.title}
                    loading="lazy"
                    className="absolute top-0 left-0 hidden h-full w-full rounded-md object-cover transition-transform duration-200 ease-in-out group-hover:scale-105 md:block"
                  />
                  <img
                    src={work.smallThumbnailImageURL}
                    alt={t(
                      work.title,
                      work.enTitle.length > 0 ? work.enTitle : work.title,
                    )}
                    loading="lazy"
                    className="absolute top-0 left-0 block h-full w-full rounded-md object-cover transition-transform duration-200 ease-in-out group-hover:scale-105 md:hidden"
                  />
                  <div className="absolute right-2 bottom-2">
                    <LikeButton
                      size={56}
                      targetWorkId={work.id}
                      targetWorkOwnerUserId={work.user.id}
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
              <UserNameBadge
                userId={work.user.id}
                userIconImageURL={withIconUrlFallback(work.user.iconUrl)}
                name={work.user.name}
                width={"lg"}
                likesCount={work.likesCount}
              />
            </div>
          ))}
      </section>
      <section className="grid grid-cols-2 gap-2 md:hidden md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {props.works
          .filter(
            (work, index, self) =>
              self.findIndex((w) => w.id === work.id) === index,
          )
          .map((work) => (
            <div key={work.id}>
              <Link
                to={`/posts/${work.id}`}
                className="relative overflow-hidden"
              >
                <div
                  className="w-full overflow-hidden"
                  style={{ paddingBottom: "100%" }}
                >
                  <img
                    src={work.smallThumbnailImageURL}
                    alt={work.title}
                    loading="lazy"
                    className="absolute top-0 left-0 block h-full w-full object-cover md:hidden "
                  />
                  <div className="absolute right-2 bottom-2">
                    <LikeButton
                      size={56}
                      targetWorkId={work.id}
                      targetWorkOwnerUserId={work.user.id}
                      defaultLiked={work.isLiked}
                      defaultLikedCount={0}
                      isBackgroundNone={true}
                      strokeWidth={2}
                      isParticle={true}
                    />
                  </div>
                </div>
              </Link>
              {props.isShowProfile && (
                <>
                  <p className="max-w-40 overflow-hidden text-ellipsis text-nowrap font-bold text-md">
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