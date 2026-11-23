import { useQuery } from "@apollo/client/index"
import { type FragmentOf, graphql } from "gql.tada"
import { PencilIcon, PinIcon, PlusIcon } from "lucide-react"
import { useContext } from "react"
import { Button } from "~/components/ui/button"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { HomeWorkFragment } from "~/routes/($lang)._main._index/components/home-work-section"
import { UserPickupEditDialog } from "~/routes/($lang)._main.users.$user._index/components/user-pickup-edit-dialog"
import {
  UserFeaturedWorks,
  UserWorksGrid,
  UserWorksSection,
} from "~/routes/($lang)._main.users.$user._index/components/user-works-gallery"

type Props = {
  userPickupWorks: FragmentOf<typeof HomeWorkFragment>[]
  userNewWorks: FragmentOf<typeof HomeWorkFragment>[]
  userId: string
  /** 作品一覧（画像）へのリンク */
  worksLink: string
  /**
   * R18 のページ（/r/users/:user）。R18 のピックアップ（featuredSensitiveWorks）と R18 の最新作品を出す。
   * 初期値も UserSensitivePickupFragment で取ったものを渡す
   */
  isSensitive?: boolean
}

export function UserPickupContents(props: Props) {
  const authContext = useContext(AuthContext)

  const t = useTranslation()

  const isMyPage = authContext.userId === props.userId

  const isSensitive = props.isSensitive === true

  const pickupKind = isSensitive ? "sensitive" : "all"

  const { data: workRes, refetch: refetchAll } = useQuery(userQuery, {
    skip: authContext.isLoading || isSensitive,
    variables: {
      userId: props.userId,
    },
  })

  const { data: sensitiveWorkRes, refetch: refetchSensitive } = useQuery(
    userSensitiveQuery,
    {
      skip: authContext.isLoading || !isSensitive,
      variables: {
        userId: props.userId,
      },
    },
  )

  const refetch = () => (isSensitive ? refetchSensitive() : refetchAll())

  // サーバーはピックアップの年齢制限を見ないので、R18 のページには R18・R18G、全年齢のページにはそれ以外だけを出す
  // （編集の初期値もこれなので、混ざっていたものは次に保存したときに外れる）
  const workDisplayed = (
    (isSensitive
      ? sensitiveWorkRes?.user?.featuredSensitiveWorks
      : workRes?.user?.featuredWorks) ?? props.userPickupWorks
  ).filter((work) => isSensitiveRating(work.rating) === isSensitive)

  const newWorkDisplayed =
    (isSensitive ? sensitiveWorkRes?.user?.works : workRes?.user?.works) ??
    props.userNewWorks

  return (
    <>
      {workDisplayed && workDisplayed.length > 0 ? (
        <UserWorksSection
          title={t("ピックアップ", "Pickups")}
          action={
            isMyPage && (
              <UserPickupEditDialog
                kind={pickupKind}
                currentWorks={workDisplayed}
                onSaved={() => refetch()}
                triggerChildren={
                  <Button
                    variant="secondary"
                    size="sm"
                    className="ml-auto h-8 gap-1.5 rounded-full"
                  >
                    <PencilIcon className="size-3.5" />
                    {t("編集", "Edit")}
                  </Button>
                }
              />
            )
          }
        >
          <UserFeaturedWorks works={workDisplayed} />
        </UserWorksSection>
      ) : (
        isMyPage && (
          <UserPickupEditDialog
            kind={pickupKind}
            currentWorks={[]}
            onSaved={() => refetch()}
            triggerChildren={
              <UserPickupEmptyButton isSensitive={isSensitive} />
            }
          />
        )
      )}
      {newWorkDisplayed && newWorkDisplayed.length > 0 && (
        <UserWorksSection title={t("最新", "Latest")} link={props.worksLink}>
          <UserWorksGrid
            works={newWorkDisplayed}
            // ピックアップが無いときは最新が一番上に来る
            priorityCount={(workDisplayed?.length ?? 0) > 0 ? 0 : 2}
          />
        </UserWorksSection>
      )}
    </>
  )
}

function isSensitiveRating(rating: string | null | undefined) {
  return rating === "R18" || rating === "R18G"
}

/**
 * 自分のプロフィールでピックアップが空のとき。ここから選べることを伝える
 */
export function UserPickupEmptyButton(
  props: React.ComponentProps<"button"> & { isSensitive?: boolean },
) {
  const t = useTranslation()
  const { isSensitive, ...buttonProps } = props

  return (
    <button
      type="button"
      {...buttonProps}
      className="flex w-full items-center gap-4 rounded-2xl border-2 border-dashed p-4 text-left transition-colors hover:border-primary/50 hover:bg-muted/50"
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <PinIcon className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-bold text-sm">
          {isSensitive
            ? t("R18 のピックアップを選ぶ", "Choose R18 pickups")
            : t("ピックアップを選ぶ", "Choose pickups")}
        </span>
        <span className="mt-0.5 block text-muted-foreground text-xs leading-5">
          {t(
            "見てほしい作品を 3 つまで、プロフィールの一番上に大きく出せます",
            "Show up to 3 favorite works big at the top of your profile",
          )}
        </span>
      </span>
      <PlusIcon className="size-5 shrink-0 text-muted-foreground" />
    </button>
  )
}

export const UserPickupFragment = graphql(
  `fragment UserPickup on UserNode @_unmask {
    featuredWorks {
      ...HomeWork
      smallThumbnailImageURL
      imageWidth
    }
    works(limit: 8, offset: 0, where: {
      ratings:[G, R15]
    }) {
      ...HomeWork
    }
  }`,
  [HomeWorkFragment],
)

/**
 * R18 のページのピックアップと最新作品（R18 の作品だけ）
 */
export const UserSensitivePickupFragment = graphql(
  `fragment UserSensitivePickup on UserNode @_unmask {
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

const userSensitiveQuery = graphql(
  `query UserSensitivePickup(
    $userId: ID!,
  ) {
    user(id: $userId) {
      ...UserSensitivePickup
    }
  }`,
  [UserSensitivePickupFragment],
)

const userQuery = graphql(
  `query User(
    $userId: ID!,
  ) {
    user(id: $userId) {
      ...UserPickup
    }
  }`,
  [UserPickupFragment],
)
