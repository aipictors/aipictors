import { Button, type ButtonProps } from "~/components/ui/button"
import { useApolloClient, useMutation } from "@apollo/client/index"
import { toast } from "sonner"
import { graphql } from "gql.tada"
import { LoaderIcon } from "lucide-react"
import { useTranslation } from "~/hooks/use-translation" // useTranslation フックをインポート

type Props = {
  id: string
  isMuted: boolean
  onChange?: (nextValue: boolean) => void
} & Pick<ButtonProps, "variant">

export function UserMuteButton (props: Props) {
  const t = useTranslation() // useTranslation フックを使う
  const apolloClient = useApolloClient()
  const [mute, { loading: isMuteLoading }] = useMutation(muteUserMutation)

  const [unMute, { loading: isUnMuteLoading }] = useMutation(unMuteUserMutation)

  const isMute = props.isMuted

  const updateMutedState = (nextValue: boolean) => {
    props.onChange?.(nextValue)
    apolloClient.cache.modify({
      id: apolloClient.cache.identify({ __typename: "UserNode", id: props.id }),
      fields: {
        isMuted() {
          return nextValue
        },
      },
    })
  }

  const muteUser = async () => {
    updateMutedState(true)
    try {
      await mute({
        variables: {
          input: {
            userId: props.id,
          },
        },
      })
      toast(t("ユーザーをミュートしました", "Muted the user"))
    } catch {
      updateMutedState(false)
      toast(t("ミュートの設定に失敗しました", "Failed to update mute setting"))
    }
  }

  const unMuteUser = async () => {
    updateMutedState(false)
    try {
      await unMute({
        variables: {
          input: {
            userId: props.id,
          },
        },
      })
      toast(t("ユーザーのミュートを解除しました", "Unmuted the user"))
    } catch {
      updateMutedState(true)
      toast(t("ミュートの設定に失敗しました", "Failed to update mute setting"))
    }
  }

  return (
    <Button
      variant={props.variant ?? "secondary"}
      onClick={isMute ? unMuteUser : muteUser}
    >
      {isMuteLoading || isUnMuteLoading ? (
        <span className="ml-2 animate-spin">
          <LoaderIcon />
        </span>
      ) : isMute ? (
        t("ミュート解除", "Unmute")
      ) : (
        t("ミュート", "Mute")
      )}
    </Button>
  )
}

const muteUserMutation = graphql(
  `mutation MuteUser($input: MuteUserInput!) {
    muteUser(input: $input) {
      id
    }
  }`,
)

const unMuteUserMutation = graphql(
  `mutation UnMuteUser($input: UnmuteUserInput!) {
    unmuteUser(input: $input) {
      id
      isMuted
    }
  }`,
)
