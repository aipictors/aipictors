import { Button, type ButtonProps } from "~/components/ui/button"
import { useMutation } from "@apollo/client/index"
import { toast } from "sonner"
import { useEffect, useState } from "react"
import { graphql } from "gql.tada"
import { LoaderIcon } from "lucide-react"
import { useTranslation } from "~/hooks/use-translation" // useTranslation フックをインポート

type Props = {
  id: string
  isMuted: boolean
} & Pick<ButtonProps, "variant">

export function UserMuteButton(props: Props) {
  const t = useTranslation() // useTranslation フックを使う
  const [mute, { loading: isMuteLoading }] = useMutation(muteUserMutation)

  const [unMute, { loading: isUnMuteLoading }] = useMutation(unMuteUserMutation)

  const [isMute, setIsMute] = useState(props.isMuted)

  useEffect(() => {
    setIsMute(props.isMuted)
  }, [props.isMuted])

  const muteUser = async () => {
    await mute({
      variables: {
        input: {
          userId: props.id,
        },
      },
    })
    toast(t("ユーザーをミュートしました", "Muted the user"))
    setIsMute(true)
  }

  const unMuteUser = async () => {
    await unMute({
      variables: {
        input: {
          userId: props.id,
        },
      },
    })
    toast(t("ユーザーのミュートを解除しました", "Unmuted the user"))
    setIsMute(false)
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
    }
  }`,
)
