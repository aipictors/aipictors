import { AppLoadingPage } from "@/_components/app/app-loading-page"
import { WorkArticle } from "@/routes/($lang)._main.works.$work/_components/work-article"
import { WorkCommentList } from "@/routes/($lang)._main.works.$work/_components/work-comment-list"
import { WorkNextAndPrevious } from "@/routes/($lang)._main.works.$work/_components/work-next-and-previous"
import { WorkRelatedList } from "@/routes/($lang)._main.works.$work/_components/work-related-list"
import { WorkUser } from "@/routes/($lang)._main.works.$work/_components/work-user"
import { Suspense } from "react"
import { WorkTagsWorks } from "@/routes/($lang)._main.works.$work/_components/work-tags-works"
import { ResponsivePhotoWorksAlbum } from "@/_components/responsive-photo-works-album"
import { useMediaQuery } from "usehooks-ts"
import { config } from "@/config"
import type { workQuery } from "@/_graphql/queries/work/work"
import type { workCommentsQuery } from "@/_graphql/queries/work/work-comments"
import type { worksQuery } from "@/_graphql/queries/work/works"
import type { ResultOf } from "gql.tada"

type Props = {
  work: NonNullable<ResultOf<typeof workQuery>>["work"]
  // tagWorksResp: NonNullable<WorksQuery>["works"]
  newWorks: NonNullable<ResultOf<typeof worksQuery>>["works"]
  comments: NonNullable<ResultOf<typeof workCommentsQuery>["work"]>["comments"]
}

/**
 * 作品詳細情報
 */
export const WorkContainer = (props: Props) => {
  const work = props.work

  if (!work) {
    return null
  }

  const relatedWorks = work.user.works.map((work) => ({
    smallThumbnailImageURL: work.smallThumbnailImageURL,
    thumbnailImagePosition: work.thumbnailImagePosition ?? 0,
    smallThumbnailImageWidth: work.smallThumbnailImageWidth,
    smallThumbnailImageHeight: work.smallThumbnailImageHeight,
    id: work.id,
    userId: work.userId,
    isLiked: false,
  }))

  const tags = props.work?.tagNames ?? []

  // ランダムにタグをひとつ
  const randomTag = tags[Math.floor(Math.random() * tags.length)]

  const isDesktop = useMediaQuery(config.mediaQuery.isDesktop)

  return (
    <div
      className="max-w-[100%] overflow-hidden"
      style={{
        margin: "auto",
      }}
    >
      <div className="flex w-full overflow-hidden p-0 md:p-4">
        <div className="flex flex-col items-center overflow-hidden">
          <div className="mx-auto w-full max-w-screen-lg">
            <Suspense fallback={<AppLoadingPage />}>
              <WorkArticle work={work} />
            </Suspense>
            <WorkRelatedList works={relatedWorks} />
            {!isDesktop && (
              <Suspense fallback={<AppLoadingPage />}>
                <WorkCommentList workId={work.id} comments={props.comments} />
              </Suspense>
            )}
            <div className="mt-2 block md:mt-0 lg:hidden">
              <Suspense>
                <WorkUser
                  userId={work.user.id}
                  userName={work.user.name}
                  userIconImageURL={work.user.iconImage?.downloadURL}
                  userFollowersCount={work.user.followersCount}
                  userBiography={work.user.biography}
                  userPromptonId={work.user.promptonUser?.id}
                  userWorksCount={work.user.worksCount}
                />
              </Suspense>
            </div>

            <section className="max-w-[1400px] space-y-4">
              <div className="flex justify-between">
                <h2 className="items-center space-x-2 font-bold text-md">
                  {"関連"}
                </h2>
              </div>
              {randomTag && (
                <Suspense fallback={<AppLoadingPage />}>
                  <WorkTagsWorks tagName={randomTag} />
                </Suspense>
              )}
              <div className="flex justify-between">
                <h2 className="items-center space-x-2 font-bold text-md">
                  {"新着"}
                </h2>
              </div>
              <ResponsivePhotoWorksAlbum works={props.newWorks} />
            </section>
          </div>
        </div>
        <div className="mt-2 hidden w-full items-start pl-4 md:mt-0 lg:block lg:max-w-md">
          <div className="mt-2 md:mt-0">
            <Suspense>
              <WorkUser
                userId={work.user.id}
                userName={work.user.name}
                userIconImageURL={work.user.iconImage?.downloadURL}
                userFollowersCount={work.user.followersCount}
                userBiography={work.user.biography}
                userPromptonId={work.user.promptonUser?.id}
                userWorksCount={work.user.worksCount}
              />
            </Suspense>
          </div>
          <WorkNextAndPrevious work={work} />
          <Suspense fallback={<AppLoadingPage />}>
            <WorkCommentList workId={work.id} comments={props.comments} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
