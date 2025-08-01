import {
  workArticleFragment,
  sensitiveWorkArticleFragment,
} from "~/routes/($lang)._main.posts.$post._index/components/work-article"
import { WorkUser } from "~/routes/($lang)._main.posts.$post._index/components/work-user"
import { useContext } from "react"
import { graphql, type FragmentOf } from "gql.tada"
import { AuthContext } from "~/contexts/auth-context"
import { useMutation, useQuery } from "@apollo/client/index"
import { WorkRelatedList } from "~/routes/($lang)._main.posts.$post._index/components/work-related-list"
import { WorkNextAndPrevious } from "~/routes/($lang)._main.posts.$post._index/components/work-next-and-previous"
import {
  type CommentListItemFragment,
  WorkCommentList,
} from "~/routes/($lang)._main.posts.$post._index/components/work-comment-list"
import type { HomeNewCommentsFragment } from "~/routes/($lang)._main._index/components/home-new-comments"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"
import {
  HomeAwardWorksSection,
  type HomeAwardWorksFragment,
} from "~/routes/($lang)._main._index/components/home-award-works"
import type { HomeWorkAwardFragment } from "~/routes/($lang)._main._index/components/home-award-work-section"
import { useTranslation } from "~/hooks/use-translation"
import { useNavigate, Link } from "react-router-dom"
import { CrossPlatformTooltip } from "~/components/cross-platform-tooltip"
import { SensitiveWorkTagsWorks } from "~/routes/($lang)._main.r.posts.$post._index/components/sensitive-work-tags-works"
import { workCommentsQuery } from "~/routes/($lang)._main.posts.$post._index/route"
import { HomeNewSensitiveCommentsSection } from "~/routes/($lang)._main._index/components/home-new-sensitive-comments"
import { SensitiveWorkArticle } from "~/routes/($lang)._main.posts.$post._index/components/sensitive-work-article"

type Props = {
  post: string
  work: FragmentOf<typeof workArticleFragment> | null
  comments: FragmentOf<typeof CommentListItemFragment>[]
  newComments: FragmentOf<typeof HomeNewCommentsFragment>[]
  awardWorks: FragmentOf<
    typeof HomeAwardWorksFragment | typeof HomeWorkAwardFragment
  >[]
}

/**
 * 作品詳細情報
 */
export function SensitiveWorkContainer(props: Props) {
  const authContext = useContext(AuthContext)

  const { data, refetch } = useQuery(sensitiveWorkQuery, {
    skip: authContext.userId !== props.work?.user?.id && authContext.isLoading,
    variables: {
      id: props.post,
    },
  })

  const work = data?.work ?? props.work

  const { data: workCommentsRet } = useQuery(workCommentsQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    variables: {
      workId: props.post,
    },
  })

  const comments = workCommentsRet?.work?.comments ?? props.comments

  const { data: userSetting } = useQuery(userSensitiveSettingQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
  })

  const tags = work?.tagNames ?? []

  const randomTag =
    tags.length > 0 ? tags[Math.floor(Math.random() * tags.length)] : null

  const _navigate = useNavigate()

  const { data: pass } = useQuery(viewerCurrentPassQuery, {})

  const { data: advertisements } = useQuery(randomCustomerAdvertisementQuery, {
    variables: {
      where: {
        isSensitive: true,
        page: "work",
      },
    },
  })

  const [updateClickedCountCustomerAdvertisement] = useMutation(
    updateClickedCountCustomerAdvertisementMutation,
  )

  const onClickAdvertisement = async () => {
    if (advertisements?.randomCustomerAdvertisement) {
      // Update advertisement click count
      await updateClickedCountCustomerAdvertisement({
        variables: {
          id: advertisements.randomCustomerAdvertisement.id,
        },
      })
    }
  }

  const passData = pass?.viewer?.currentPass

  const isSubscriptionUser =
    passData?.type === "LITE" ||
    passData?.type === "STANDARD" ||
    passData?.type === "PREMIUM"

  const t = useTranslation()

  if (work === null || work.isDeleted === true) {
    return null
  }

  return (
    <div
      className="space-y-4 overflow-hidden"
      style={{
        margin: "auto",
      }}
    >
      <div className="flex w-full justify-center overflow-hidden">
        <div className="flex w-full flex-col items-center overflow-hidden">
          <div className="mx-auto w-full space-y-4">
            <SensitiveWorkArticle
              work={work}
              userSetting={userSetting?.userSetting ?? undefined}
            />
            {work.user !== null && work.user.works.length > 0 && (
              <WorkRelatedList
                works={work.user.works.map((relatedWork) => ({
                  smallThumbnailImageURL: relatedWork.smallThumbnailImageURL,
                  thumbnailImagePosition:
                    relatedWork.thumbnailImagePosition ?? 0,
                  smallThumbnailImageWidth:
                    relatedWork.smallThumbnailImageWidth,
                  smallThumbnailImageHeight:
                    relatedWork.smallThumbnailImageHeight,
                  id: relatedWork.id,
                  userId: relatedWork.userId,
                  isLiked: relatedWork.isLiked,
                  subWorksCount: relatedWork.subWorksCount,
                  commentsCount: relatedWork.commentsCount,
                }))}
              />
            )}
            {work.isCommentsEditable && (
              <WorkCommentList
                workId={work.id}
                comments={comments}
                workOwnerIconImageURL={work.user?.iconUrl}
                isWorkOwnerBlocked={work.user?.isBlocked ?? false}
              />
            )}
            {work.user !== null && (
              <div className="block md:mt-0 lg:hidden">
                <WorkUser
                  userId={work.user.id}
                  userLogin={work.user.login}
                  userName={work.user.name}
                  userIconImageURL={withIconUrlFallback(work.user.iconUrl)}
                  userFollowersCount={work.user.followersCount}
                  userBiography={work.user.biography ?? ""}
                  userEnBiography={work.user.enBiography ?? null}
                  userPromptonId={work.user.promptonUser?.id}
                  userWorksCount={work.user.worksCount}
                />
              </div>
            )}
          </div>
        </div>
        <div className="mt-2 hidden w-full flex-col items-start space-y-4 pl-4 md:mt-0 md:flex md:max-w-80">
          {work.user !== null && (
            <div className="w-full">
              <WorkUser
                userId={work.user.id}
                userName={work.user.name}
                userLogin={work.user.login}
                userIconImageURL={withIconUrlFallback(work.user.iconUrl)}
                userFollowersCount={work.user.followersCount}
                userBiography={work.user.biography ?? ""}
                userEnBiography={work.user.enBiography ?? null}
                userPromptonId={work.user.promptonUser?.id}
                userWorksCount={work.user.worksCount}
              />
            </div>
          )}
          <div className="invisible flex w-full flex-col space-y-4 md:visible">
            <WorkNextAndPrevious work={work} />
            <div className="flex w-full flex-col space-y-4">
              <div className="relative grid gap-4">
                {!isSubscriptionUser &&
                  advertisements &&
                  advertisements.randomCustomerAdvertisement && (
                    <div className="relative border">
                      <Link
                        onClick={onClickAdvertisement}
                        target="_blank"
                        to={advertisements.randomCustomerAdvertisement.url}
                      >
                        <img
                          src={
                            advertisements.randomCustomerAdvertisement.imageUrl
                          }
                          alt="Advertisement"
                        />
                      </Link>
                      <div className="absolute top-0 right-0">
                        <CrossPlatformTooltip
                          text={t(
                            "提携広告です、広告主様を募集中です。メールまたはDMにてご連絡ください。",
                            "This is a partnered advertisement. We are accepting new advertisers. Please contact us via email or DM.",
                          )}
                        />
                      </div>
                    </div>
                  )}
                {!isSubscriptionUser && (
                  <Link to="/generation">
                    <img
                      src="https://assets.aipictors.com/Aipictors_01.webp"
                      alt="Aipictors Logo"
                    />
                  </Link>
                )}
                {props.newComments && props.newComments.length > 0 && (
                  <HomeNewSensitiveCommentsSection
                    comments={props.newComments}
                  />
                )}
                {props.awardWorks && (
                  <HomeAwardWorksSection works={props.awardWorks} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <section className="m-auto space-y-4">
        {randomTag && (
          <>
            <div className="flex justify-between">
              <h2 className="items-center space-x-2 font-bold text-md">
                {t("おすすめ", "Recommended")}
              </h2>
            </div>
            <SensitiveWorkTagsWorks
              tagName={randomTag}
              rating={work.rating ?? "R18"}
            />
          </>
        )}
      </section>
      {/* <div className="flex w-full flex-col space-y-4 md:hidden">
        <AppSideMenu />
      </div> */}
    </div>
  )
}

const _workQuery = graphql(
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

const updateClickedCountCustomerAdvertisementMutation = graphql(
  `mutation UpdateClickedCountCustomerAdvertisement($id: ID!) {
    updateClickedCountCustomerAdvertisement(id: $id) {
      id
    }
  }`,
)

const viewerCurrentPassQuery = graphql(
  `query ViewerCurrentPass {
    viewer {
      id
      currentPass {
        id
        type
      }
    }
  }`,
)

export const SideMenuAdvertisementsFragment = graphql(
  `fragment SideMenuAdvertisementsFields on CustomerAdvertisementNode @_unmask {
      id
      imageUrl
      url
      displayProbability
      clickCount
      impressionCount
      isSensitive
      createdAt
      page
      startAt
      endAt
      isActive
  }`,
)

const randomCustomerAdvertisementQuery = graphql(
  `query RandomCustomerAdvertisement($where: RandomCustomerAdvertisementWhereInput!) {
    randomCustomerAdvertisement(where: $where) {
      ...SideMenuAdvertisementsFields
    }
  }`,
  [SideMenuAdvertisementsFragment],
)

export const userSensitiveSettingFragment = graphql(
  `fragment UserSensitiveSetting on UserSettingNode @_unmask {
      isAnonymousSensitiveLike
  }`,
)

const userSensitiveSettingQuery = graphql(
  `query UserSensitiveSetting {
    userSetting {
      ...UserSensitiveSetting
    }
  }`,
  [userSensitiveSettingFragment],
)
