import {
  WorkArticle,
  workArticleFragment,
  sensitiveWorkArticleFragment,
} from "~/routes/($lang)._main.posts.$post._index/components/work-article"
import { WorkUser } from "~/routes/($lang)._main.posts.$post._index/components/work-user"
import { useContext } from "react"
import { graphql, type FragmentOf } from "gql.tada"
import { AuthContext } from "~/contexts/auth-context"
import { useQuery } from "@apollo/client/index"
import { WorkRelatedList } from "~/routes/($lang)._main.posts.$post._index/components/work-related-list"
import { WorkTagsWorks } from "~/routes/($lang)._main.posts.$post._index/components/work-tags-works"
import { WorkNextAndPrevious } from "~/routes/($lang)._main.posts.$post._index/components/work-next-and-previous"
import {
  type CommentListItemFragment,
  WorkCommentList,
} from "~/routes/($lang)._main.posts.$post._index/components/work-comment-list"
import type { HomeNewCommentsFragment } from "~/routes/($lang)._main._index/components/home-new-comments"
import { ExchangeIconUrl } from "~/utils/exchange-icon-url"
import { AppSideMenu } from "~/components/app/app-side-menu"
import type { HomeAwardWorksFragment } from "~/routes/($lang)._main._index/components/home-award-works"
import type { HomeWorkAwardFragment } from "~/routes/($lang)._main._index/components/home-award-work-section"

type Props = {
  post: string
  work: FragmentOf<typeof workArticleFragment> | null
  comments: FragmentOf<typeof CommentListItemFragment>[]
  isDraft?: boolean
  isSensitive?: boolean
  newComments: FragmentOf<typeof HomeNewCommentsFragment>[]
  awardWorks: FragmentOf<
    typeof HomeAwardWorksFragment | typeof HomeWorkAwardFragment
  >[]
}

/**
 * 作品詳細情報
 */
export function WorkContainer(props: Props) {
  const authContext = useContext(AuthContext)

  const { data, refetch } = useQuery(
    props.isSensitive ? sensitiveWorkQuery : workQuery,
    {
      skip: authContext.userId !== props.work?.user.id && authContext.isLoading,
      variables: {
        id: props.post,
      },
    },
  )

  const work = data?.work ?? props.work

  if (work === null) {
    return null
  }

  const tags = work?.tagNames ?? []

  const randomTag =
    tags.length > 0 ? tags[Math.floor(Math.random() * tags.length)] : null

  return (
    <div
      className="space-y-4 overflow-hidden"
      style={{
        margin: "auto",
      }}
    >
      <div className="flex w-full justify-center overflow-hidden">
        <div className="flex flex-col items-center overflow-hidden">
          <div className="mx-auto w-full space-y-4">
            <WorkArticle isDraft={props.isDraft} work={work} />
            <WorkRelatedList
              works={work.user.works.map((relatedWork) => ({
                smallThumbnailImageURL: relatedWork.smallThumbnailImageURL,
                thumbnailImagePosition: relatedWork.thumbnailImagePosition ?? 0,
                smallThumbnailImageWidth: relatedWork.smallThumbnailImageWidth,
                smallThumbnailImageHeight:
                  relatedWork.smallThumbnailImageHeight,
                id: relatedWork.id,
                userId: relatedWork.userId,
                isLiked: relatedWork.isLiked,
                subWorksCount: relatedWork.subWorksCount,
              }))}
            />
            {work.isCommentsEditable && (
              <WorkCommentList workId={work.id} comments={props.comments} />
            )}
            <div className="block md:mt-0 lg:hidden">
              <WorkUser
                userId={work.user.id}
                userLogin={work.user.login}
                userName={work.user.name}
                userIconImageURL={ExchangeIconUrl(work.user.iconUrl)}
                userFollowersCount={work.user.followersCount}
                userBiography={work.user.biography ?? ""}
                userPromptonId={work.user.promptonUser?.id}
                userWorksCount={work.user.worksCount}
              />
            </div>
          </div>
        </div>
        <div className="mt-2 hidden w-full flex-col items-start space-y-4 pl-4 md:mt-0 md:flex md:max-w-80">
          <div className="w-full">
            <WorkUser
              userId={work.user.id}
              userName={work.user.name}
              userLogin={work.user.login}
              userIconImageURL={ExchangeIconUrl(work.user.iconUrl)}
              userFollowersCount={work.user.followersCount}
              userBiography={work.user.biography ?? ""}
              userPromptonId={work.user.promptonUser?.id}
              userWorksCount={work.user.worksCount}
            />
          </div>
          <div className="invisible flex w-full flex-col space-y-4 md:visible">
            <WorkNextAndPrevious work={work} />
            <AppSideMenu
              homeParticles={{
                newComments: props.newComments,
                awardWorks: props.awardWorks,
              }}
              isSensitive={props.isSensitive ?? false}
              isShowGenerationAds={true}
              isShowCustomerAds={true}
            />
          </div>
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
            <WorkTagsWorks
              isSensitive={props.isSensitive}
              tagName={randomTag}
              rating={work.rating ?? "G"}
            />
          </>
        )}
      </section>
      <div className="flex w-full flex-col space-y-4 md:hidden">
        <AppSideMenu
          homeParticles={{
            newComments: props.newComments,
            awardWorks: props.awardWorks,
          }}
          isSensitive={props.isSensitive ?? false}
          isShowGenerationAds={false}
          isShowCustomerAds={true}
        />
      </div>
    </div>
  )
}

const workQuery = graphql(
  `query Work($id: ID!) {
    work(id: $id) {
      ...WorkArticle
    }
  }`,
  [workArticleFragment],
)

const sensitiveWorkQuery = graphql(
  `query Work($id: ID!) {
    work(id: $id) {
      ...WorkArticle
    }
  }`,
  [sensitiveWorkArticleFragment],
)
