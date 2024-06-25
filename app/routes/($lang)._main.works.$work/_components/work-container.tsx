import { AppLoadingPage } from "@/_components/app/app-loading-page"
import { WorkArticle } from "@/routes/($lang)._main.works.$work/_components/work-article"
import { WorkNextAndPrevious } from "@/routes/($lang)._main.works.$work/_components/work-next-and-previous"
import { WorkRelatedList } from "@/routes/($lang)._main.works.$work/_components/work-related-list"
import { WorkUser } from "@/routes/($lang)._main.works.$work/_components/work-user"
import { Suspense } from "react"
import { WorkTagsWorks } from "@/routes/($lang)._main.works.$work/_components/work-tags-works"
import type { workQuery } from "@/_graphql/queries/work/work"
import type { workCommentsQuery } from "@/_graphql/queries/work/work-comments"
import type { ResultOf } from "gql.tada"
import { HomeWorksRecommendedSection } from "@/routes/($lang)._main._index/_components/home-works-recommended-section"
import { IconUrl } from "@/_components/icon-url"
import { ConstructionAlert } from "@/_components/construction-alert"
import { WorkCommentList } from "@/routes/($lang)._main.works.$work/_components/work-comment-list"

type Props = {
  work: NonNullable<ResultOf<typeof workQuery>>["work"]
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

  const randomTag =
    tags.length > 0 ? tags[Math.floor(Math.random() * tags.length)] : null

  return (
    <div
      className="max-w-[100%] overflow-hidden"
      style={{
        margin: "auto",
      }}
    >
      <div className="px-0 py-2 md:px-4">
        <ConstructionAlert
          type="WARNING"
          message="このページは現在開発中です。不具合が起きる可能性があります。"
          fallbackURL={`https://www.aipictors.com/works/${work.id}`}
          date={"2024-07-30"}
        />
      </div>
      <div className="flex w-full overflow-hidden p-0 md:p-4">
        <div className="flex flex-col items-center overflow-hidden">
          <div className="mx-auto w-full max-w-screen-lg space-y-2">
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
        <div className="mt-2 hidden w-full items-start pl-4 md:mt-0 lg:block lg:max-w-md">
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
      <section className="max-w-[1400px] space-y-4">
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
