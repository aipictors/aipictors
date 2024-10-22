import { Link, useNavigate } from "react-router-dom"
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
import { CrossPlatformTooltip } from "~/components/cross-platform-tooltip"
import {
  HomeAwardWorksSection,
  type HomeAwardWorksFragment,
} from "~/routes/($lang)._main._index/components/home-award-works"
import { useTranslation } from "~/hooks/use-translation"

type homeParticles = {
  newPostedUsers?: FragmentOf<typeof HomeNewPostedUsersFragment>[]
  newComments?: FragmentOf<typeof HomeNewCommentsFragment>[]
  awardWorks?: FragmentOf<
    typeof HomeAwardWorksFragment | typeof HomeWorkAwardFragment
  >[]
}

type Props = {
  homeParticles: homeParticles
  isShowSensitiveButton?: boolean
  isShowGenerationAds?: boolean
  isShowCustomerAds?: boolean
}

export function AppSensitiveSideMenu(props: Props) {
  const navigate = useNavigate()
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

  return (
    <>
      <div className="flex w-full flex-col space-y-4">
        <div className="relative grid gap-4">
          {props.isShowSensitiveButton && (
            <Button
              onClick={() => {
                navigate("/")
              }}
              variant={"secondary"}
              className="flex w-full transform cursor-pointer items-center"
            >
              <p className="text-sm">{t("全年齢", "All Ages")}</p>
            </Button>
          )}
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
                    text={t(
                      "提携広告です、広告主様を募集中です。メールまたはDMにてご連絡ください。",
                      "This is a partnered advertisement. We are accepting new advertisers. Please contact us via email or DM.",
                    )}
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
