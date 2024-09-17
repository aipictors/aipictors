import {} from "react"
import { Link, useNavigate } from "react-router-dom"
import { AppConfirmDialog } from "~/components/app/app-confirm-dialog"
import {
  HomeNewCommentsSection,
  type HomeNewCommentsFragment,
} from "~/routes/($lang)._main._index/components/home-new-comments"
import {
  type HomeNewPostedUsersFragment,
  HomeNewUsersSection,
} from "~/routes/($lang)._main._index/components/home-new-users-section"
import { graphql, type FragmentOf } from "gql.tada"
import { Button } from "~/components/ui/button"
import { useMutation, useQuery } from "@apollo/client/index"
import type { HomeWorkAwardFragment } from "~/routes/($lang)._main._index/components/home-award-work-section"
import { addHours } from "date-fns"
import { CrossPlatformTooltip } from "~/components/cross-platform-tooltip"
import {
  HomeAwardWorksSection,
  type HomeAwardWorksFragment,
} from "~/routes/($lang)._main._index/components/home-award-works"

type homeParticles = {
  newPostedUsers?: FragmentOf<typeof HomeNewPostedUsersFragment>[]
  newComments?: FragmentOf<typeof HomeNewCommentsFragment>[]
  awardWorks?: FragmentOf<
    typeof HomeAwardWorksFragment | typeof HomeWorkAwardFragment
  >[]
}

type Props = {
  isSensitive?: boolean
  homeParticles: homeParticles
  isShowSensitiveButton?: boolean
  isShowGenerationAds?: boolean
  isShowCustomerAds?: boolean
}

const toJST = (date: Date) => {
  return addHours(date, 9) // UTCに対して+9時間でJSTに変換
}

/**
 * サイドメニュー
 */
export function AppSideMenu(props: Props) {
  const navigate = useNavigate()

  const { data: pass } = useQuery(viewerCurrentPassQuery, {})

  const { data: advertisements } = useQuery(randomCustomerAdvertisementQuery, {
    variables: {
      where: {
        isSensitive: !!props.isSensitive,
        page: "work",
      },
    },
  })

  const [updateClickedCountCustomerAdvertisement] = useMutation(
    updateClickedCountCustomerAdvertisementMutation,
  )

  const onClickAdvertisement = async () => {
    if (advertisements?.randomCustomerAdvertisement) {
      // 広告クリック数を更新
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

  return (
    <>
      <div className="flex w-full flex-col space-y-4">
        <div className="relative grid gap-4">
          {props.isShowSensitiveButton &&
            (!props.isSensitive ? (
              <AppConfirmDialog
                title={"確認"}
                description={
                  "センシティブな作品を表示します、あなたは18歳以上ですか？"
                }
                onNext={() => {
                  navigate("/r")
                }}
                cookieKey={"check-sensitive-ranking"}
                onCancel={() => {}}
              >
                <Button
                  variant={"secondary"}
                  className="flex w-full transform cursor-pointer items-center"
                >
                  <p className="text-sm">{"センシティブ"}</p>
                </Button>
              </AppConfirmDialog>
            ) : (
              <Button
                onClick={() => {
                  navigate("/")
                }}
                variant={"secondary"}
                className="flex w-full transform cursor-pointer items-center"
              >
                <p className="text-sm">{"全年齢"}</p>
              </Button>
            ))}
          {!isSubscriptionUser &&
            props.isShowCustomerAds &&
            advertisements &&
            advertisements.randomCustomerAdvertisement && (
              <div className="relative border">
                <Link
                  onClick={onClickAdvertisement}
                  target="_blank"
                  to={advertisements.randomCustomerAdvertisement.url}
                >
                  <img
                    src={advertisements.randomCustomerAdvertisement.imageUrl}
                    alt="Advertisement"
                  />
                </Link>
                <div className="absolute top-0 right-0">
                  <CrossPlatformTooltip
                    text={
                      "提携広告です、広告主様を募集中です。メールまたはDMにてご連絡ください。"
                    }
                  />
                </div>
              </div>
            )}
          {!isSubscriptionUser && props.isShowGenerationAds && (
            <Link to="/generation">
              <img
                src="https://assets.aipictors.com/Aipictors_01.webp"
                alt="Aipictors Logo"
              />
            </Link>
          )}
          {props.homeParticles.newPostedUsers && (
            <HomeNewUsersSection users={props.homeParticles.newPostedUsers} />
          )}
          {props.homeParticles.newComments &&
            props.homeParticles.newComments.length > 0 && (
              <HomeNewCommentsSection
                comments={props.homeParticles.newComments}
              />
            )}
          {props.homeParticles.awardWorks && (
            <HomeAwardWorksSection works={props.homeParticles.awardWorks} />
          )}
        </div>
      </div>
    </>
  )
}

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

const updateClickedCountCustomerAdvertisementMutation = graphql(
  `mutation UpdateClickedCountCustomerAdvertisement($id: ID!) {
    updateClickedCountCustomerAdvertisement(id: $id) {
      id
    }
  }`,
)
