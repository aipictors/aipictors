import { useQuery } from "@apollo/client/index"
import { type FragmentOf, graphql } from "gql.tada"
import { PencilIcon } from "lucide-react"
import { useContext } from "react"
import { Button } from "~/components/ui/button"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import {
  HomeWorkFragment,
  HomeWorkSection,
} from "~/routes/($lang)._main._index/components/home-work-section"
import { UserPickupEmptyButton } from "~/routes/($lang)._main.users.$user._index/components/user-pickup-contents"
import { UserPickupEditDialog } from "~/routes/($lang)._main.users.$user._index/components/user-pickup-edit-dialog"

type Props = {
  userPickupWorks: FragmentOf<typeof HomeWorkFragment>[]
  userNewWorks: FragmentOf<typeof HomeWorkFragment>[]
  userId: string
}

export function UserSensitivePickupContents(props: Props) {
  const authContext = useContext(AuthContext)
  const t = useTranslation()
  const isMyPage = authContext.userId === props.userId

  const { data: workRes, refetch } = useQuery(userQuery, {
    skip: authContext.isLoading,
    variables: {
      userId: props.userId,
    },
  })

  const workDisplayed =
    workRes?.user?.featuredSensitiveWorks ?? props.userPickupWorks

  const newWorkDisplayed = workRes?.user?.works ?? props.userNewWorks

  return (
    <div className="items-center">
      {newWorkDisplayed && newWorkDisplayed.length > 0 && (
        <HomeWorkSection
          title="最新"
          works={newWorkDisplayed}
          isCropped={false}
        />
      )}
      {workDisplayed && workDisplayed.length > 0 ? (
        <div className="relative">
          {isMyPage && (
            <div className="absolute top-0 right-0 z-10">
              <UserPickupEditDialog
                kind="sensitive"
                currentWorks={workDisplayed}
                onSaved={() => refetch()}
                triggerChildren={
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-8 gap-1.5 rounded-full"
                  >
                    <PencilIcon className="size-3.5" />
                    {t("編集", "Edit")}
                  </Button>
                }
              />
            </div>
          )}
          <HomeWorkSection
            title="ピックアップ"
            works={workDisplayed}
            isCropped={true}
          />
        </div>
      ) : (
        isMyPage && (
          <div className="mt-6">
            <UserPickupEditDialog
              kind="sensitive"
              currentWorks={[]}
              onSaved={() => refetch()}
              triggerChildren={<UserPickupEmptyButton isSensitive />}
            />
          </div>
        )
      )}
    </div>
  )
}

export const UserSensitivePickupFragment = graphql(
  `fragment UserPickup on UserNode @_unmask {
    featuredSensitiveWorks {
      ...HomeWork
      smallThumbnailImageURL
      imageWidth
    }
    works(limit: 8, offset: 0, where: {
      isSensitive: true
    }) {
      ...HomeWork
    }
  }`,
  [HomeWorkFragment],
)

const userQuery = graphql(
  `query User(
    $userId: ID!,
  ) {
    user(id: $userId) {
      ...UserPickup
    }
  }`,
  [UserSensitivePickupFragment],
)
