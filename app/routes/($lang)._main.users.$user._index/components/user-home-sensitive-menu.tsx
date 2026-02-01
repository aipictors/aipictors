import { useNavigate } from "@remix-run/react"
import { type FragmentOf, graphql, readFragment } from "gql.tada"
import { RefreshCcwIcon } from "lucide-react"
import { Button } from "~/components/ui/button"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  user: FragmentOf<typeof UserHomeMenuSensitiveFragment>
}

export function UserHomeSensitiveMenu(props: Props) {
  const cachedUser = readFragment(UserHomeMenuSensitiveFragment, props.user)

  const t = useTranslation()

  const navigate = useNavigate()

  return (
    <div className="mx-auto w-full max-w-6xl px-4 md:px-8">
      {/* Mobile: compact top actions */}
      <div className="flex items-center justify-end gap-2 md:hidden">
        <Button
          onClick={() => {
            navigate(`/users/${cachedUser.login}`)
          }}
          size="icon"
          variant="secondary"
          aria-label={t("全年齢", "G")}
          title={t("全年齢", "G")}
        >
          <RefreshCcwIcon className="size-4" />
        </Button>
      </div>

      {/* Desktop actions */}
      <div className="mt-4 hidden w-full items-center justify-end gap-3 md:flex md:gap-4">
        <Button
          onClick={() => {
            navigate(`/users/${cachedUser.login}`)
          }}
          variant={"secondary"}
        >
          <div className="flex cursor-pointer items-center">
            <RefreshCcwIcon className="mr-1 w-3" />
            <p className="text-sm">{t("全年齢", "G")}</p>
          </div>
        </Button>
      </div>
    </div>
  )
}

export const UserHomeMenuSensitiveFragment = graphql(
  `fragment UserHomeMenuSensitiveFragment on UserNode {
    id
    login
    isFollowee
    isFollower
    isMuted
    isBlocked
    name
    followersCount
    receivedLikesCount
    receivedSensitiveLikesCount
    promptonUser {
      id
    }
  }`,
  [],
)
