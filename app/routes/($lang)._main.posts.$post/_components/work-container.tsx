import { AppLoadingPage } from "@/_components/app/app-loading-page"
import {
  WorkArticle,
  type workArticleFragment,
} from "@/routes/($lang)._main.posts.$post/_components/work-article"
import { WorkNextAndPrevious } from "@/routes/($lang)._main.posts.$post/_components/work-next-and-previous"
import { WorkRelatedList } from "@/routes/($lang)._main.posts.$post/_components/work-related-list"
import { WorkUser } from "@/routes/($lang)._main.posts.$post/_components/work-user"
import { Suspense } from "react"
import { WorkTagsWorks } from "@/routes/($lang)._main.posts.$post/_components/work-tags-works"
import type { FragmentOf } from "gql.tada"
import { HomeWorksRecommendedSection } from "@/routes/($lang)._main._index/_components/home-works-recommended-section"
import { IconUrl } from "@/_components/icon-url"
import {
  type commentFragment,
  WorkCommentList,
} from "@/routes/($lang)._main.posts.$post/_components/work-comment-list"

type Props = {
  work: FragmentOf<typeof workArticleFragment>
  comments: FragmentOf<typeof commentFragment>[]
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
    subWorksCount: work.subWorksCount,
  }))

  const tags = props.work?.tagNames ?? []

  const randomTag =
    tags.length > 0 ? tags[Math.floor(Math.random() * tags.length)] : null

  return (
    <div
      className="max-w-[100%] space-y-4 overflow-hidden"
      style={{
        margin: "auto",
      }}
    >
      <div className="flex w-full justify-center overflow-hidden">
        <div className="flex flex-col items-center overflow-hidden">
          <div className="mx-auto w-full max-w-[1400px] space-y-2">
            <Suspense fallback={<AppLoadingPage />}>
              <WorkArticle work={work} />
            </Suspense>
            <WorkRelatedList works={relatedWorks} />
            <Suspense fallback={<AppLoadingPage />}>
              <WorkCommentList workId={work.id} comments={props.comments} />
            </Suspense>
            <div className="mt-2 block md:mt-0 lg:hidden">
              <Suspense>
                <WorkUser
                  userId={work.user.id}
                  userLogin={work.user.login}
                  userName={work.user.name}
                  userIconImageURL={IconUrl(work.user.iconUrl)}
                  userFollowersCount={work.user.followersCount}
                  userBiography={work.user.biography}
                  userPromptonId={work.user.promptonUser?.id}
                  userWorksCount={work.user.worksCount}
                />
              </Suspense>
            </div>
          </div>
        </div>
        <div className="mt-2 hidden w-full items-start pl-4 md:mt-0 lg:block lg:max-w-80">
          <div className="mt-2 md:mt-0">
            <Suspense>
              <WorkUser
                userId={work.user.id}
                userName={work.user.name}
                userLogin={work.user.login}
                userIconImageURL={IconUrl(work.user.iconUrl)}
                userFollowersCount={work.user.followersCount}
                userBiography={work.user.biography}
                userPromptonId={work.user.promptonUser?.id}
                userWorksCount={work.user.worksCount}
              />
            </Suspense>
          </div>
          <WorkNextAndPrevious work={work} />
        </div>
      </div>
      <section className="m-auto space-y-4">
        {randomTag ? (
          <>
            <div className="flex justify-between">
              <h2 className="items-center space-x-2 font-bold text-md">
                {"おすすめ"}
              </h2>
            </div>
            <Suspense fallback={<AppLoadingPage />}>
              <WorkTagsWorks tagName={randomTag} rating={work.rating ?? "G"} />
            </Suspense>
          </>
        ) : (
          <Suspense fallback={<AppLoadingPage />}>
            <HomeWorksRecommendedSection
              isSensitive={work.rating === "R18" || work.rating === "R18G"}
            />
          </Suspense>
        )}
      </section>
    </div>
  )
}