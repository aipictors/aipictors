import { AppLoadingPage } from "@/_components/app/app-loading-page"
import {
  WorkArticle,
  workArticleFragment,
} from "@/routes/($lang)._main.posts.$post/_components/work-article"
import { WorkNextAndPrevious } from "@/routes/($lang)._main.posts.$post/_components/work-next-and-previous"
import { WorkRelatedList } from "@/routes/($lang)._main.posts.$post/_components/work-related-list"
import { WorkUser } from "@/routes/($lang)._main.posts.$post/_components/work-user"
import { Suspense, useContext } from "react"
import { WorkTagsWorks } from "@/routes/($lang)._main.posts.$post/_components/work-tags-works"
import { graphql, type FragmentOf } from "gql.tada"
import { IconUrl } from "@/_components/icon-url"
import {
  type commentFragment,
  WorkCommentList,
} from "@/routes/($lang)._main.posts.$post/_components/work-comment-list"
import { AuthContext } from "@/_contexts/auth-context"
import { useSuspenseQuery } from "@apollo/client/index"

type Props = {
  work: FragmentOf<typeof workArticleFragment>
  comments: FragmentOf<typeof commentFragment>[]
  iconUrl: string
}

/**
 * 作品詳細情報
 */
export const WorkContainer = (props: Props) => {
  const authContext = useContext(AuthContext)

  const workQuery = graphql(
    `query Work($id: ID!) {
      work(id: $id) {
        ...WorkArticle
      }
    }`,
    [workArticleFragment],
  )

  const { data, refetch } = useSuspenseQuery(workQuery, {
    skip: authContext.userId !== props.work.user.id,
    variables: {
      id: props.work.id,
    },
  })

  const work = data?.work ?? props.work

  if (!work) {
    return null
  }

  const relatedWorks = work.user.works.map((relatedWork) => ({
    smallThumbnailImageURL: relatedWork.smallThumbnailImageURL,
    thumbnailImagePosition: relatedWork.thumbnailImagePosition ?? 0,
    smallThumbnailImageWidth: relatedWork.smallThumbnailImageWidth,
    smallThumbnailImageHeight: relatedWork.smallThumbnailImageHeight,
    id: relatedWork.id,
    userId: relatedWork.userId,
    isLiked: false,
    subWorksCount: relatedWork.subWorksCount,
  }))

  const tags = work?.tagNames ?? []

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
          <div className="mx-auto w-full space-y-4">
            <Suspense fallback={<AppLoadingPage />}>
              <WorkArticle work={work} />
            </Suspense>
            <WorkRelatedList works={relatedWorks} />
            {work.isCommentsEditable && (
              <Suspense fallback={<AppLoadingPage />}>
                <WorkCommentList workId={work.id} comments={props.comments} />
              </Suspense>
            )}
            <div className="block md:mt-0 lg:hidden">
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
        <div className="mt-2 hidden w-full flex-col items-start space-y-4 pl-4 md:mt-0 lg:flex lg:max-w-80">
          <div className="w-full">
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
        {randomTag && (
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
        )}
      </section>
    </div>
  )
}
