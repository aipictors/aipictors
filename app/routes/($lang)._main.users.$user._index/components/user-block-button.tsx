import { Button, type ButtonProps } from "~/components/ui/button"
import { toast } from "sonner"
import { useEffect, useState } from "react"
import { LoaderIcon } from "lucide-react"
import { useTranslation } from "~/hooks/use-translation"
import { graphql } from "gql.tada"
import { useMutation } from "@apollo/client/index"

type Props = {
  id: string
  isBlocked: boolean
} & Pick<ButtonProps, "variant">

export function UserBlockButton (props: Props) {
  const t = useTranslation()
  const [block, { loading: isBlockLoading }] = useMutation(blockUserMutation)
  const [unBlock, { loading: isUnBlockLoading }] =
    useMutation(unBlockUserMutation)

  const [isBlocked, setIsBlocked] = useState(props.isBlocked)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setIsBlocked(props.isBlocked)
  }, [props.isBlocked])

  const blockUser = async () => {
    setIsLoading(true)
    await block({
      variables: {
        input: {
          userId: props.id,
        },
      },
    })
    toast(t("ユーザーをブロックしました", "Blocked the user"))
    setIsBlocked(true)
    setIsLoading(false)
    console.log("Blocking user:", props.id)
  }

  const unBlockUser = async () => {
    setIsLoading(true)
    await unBlock({
      variables: {
        input: {
          userId: props.id,
        },
      },
    })
    toast(t("ユーザーのブロックを解除しました", "Unblocked the user"))
    setIsBlocked(false)
    setIsLoading(false)
    console.log("Unblocking user:", props.id)
  }

  return (
    <Button
      variant={props.variant ?? "secondary"}
      onClick={isBlocked ? unBlockUser : blockUser}
    >
      {isLoading ? (
        <span className="ml-2 animate-spin">
          <LoaderIcon />
        </span>
      ) : isBlocked ? (
        t("ブロック解除", "Unblock")
      ) : (
        t("ブロック", "Block")
      )}
    </Button>
  )
}

const blockUserMutation = graphql(
  `mutation blockUser($input: BlockUserInput!) {
    blockUser(input: $input) {
      id
    }
  }`,
)

const unBlockUserMutation = graphql(
  `mutation unBlockUser($input: UnblockUserInput!) {
    unblockUser(input: $input) {
      id
    }
  }`,
)
