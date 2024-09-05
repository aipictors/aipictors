import {} from "react"
import { RefreshCcwIcon } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { AppConfirmDialog } from "~/components/app/app-confirm-dialog"
import {
  type HomeNewCommentsFragment,
  HomeNewCommentsSection,
} from "~/routes/($lang)._main._index/components/home-new-comments"
import {
  type HomeNewPostedUsersFragment,
  HomeNewUsersSection,
} from "~/routes/($lang)._main._index/components/home-new-users-section"
import { graphql, type FragmentOf } from "gql.tada"
import { Button } from "~/components/ui/button"
import { useQuery } from "@apollo/client/index"
import {
  HomeAwardWorksSection,
  type HomeAwardWorksFragment,
} from "~/routes/($lang)._main._index/components/home-award-works"
import type { HomeWorkAwardFragment } from "~/routes/($lang)._main._index/components/home-award-work-section"

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
}

/**
 * サイドメニュー
 */
export function AppSideMenu(props: Props) {
  const navigate = useNavigate()

  const { data: pass } = useQuery(viewerCurrentPassQuery, {})

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
                  navigate("/sensitive")
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
                <RefreshCcwIcon className="mr-1 w-3" />
                <p className="text-sm">{"対象年齢"}</p>
              </Button>
            ))}
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
