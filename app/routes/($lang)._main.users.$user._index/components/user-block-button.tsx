import { Button, type ButtonProps } from "~/components/ui/button"
import { useApolloClient, useMutation } from "@apollo/client/index"
import { toast } from "sonner"
import { useState } from "react"
import { LoaderIcon } from "lucide-react"
import { useTranslation } from "~/hooks/use-translation"
import { graphql } from "gql.tada"

type Props = {
  id: string
  isBlocked: boolean
  onChange?: (nextValue: boolean) => void
} & Pick<ButtonProps, "variant">

export function UserBlockButton (props: Props) {
  const t = useTranslation()
  const apolloClient = useApolloClient()
  const [block, { loading: isBlockLoading }] = useMutation(blockUserMutation)
  const [unBlock, { loading: isUnBlockLoading }] =
    useMutation(unBlockUserMutation)

  const [isLoading, setIsLoading] = useState(false)

  const isBlocked = props.isBlocked

  const updateBlockedState = (nextValue: boolean) => {
    props.onChange?.(nextValue)
    apolloClient.cache.modify({
      id: apolloClient.cache.identify({ __typename: "UserNode", id: props.id }),
      fields: {
        isBlocked() {
          return nextValue
        },
      },
    })
  }

  const blockUser = async () => {
    setIsLoading(true)
    updateBlockedState(true)
    try {
      await block({
        variables: {
          input: {
            userId: props.id,
          },
        },
      })
      toast(t("ユーザーをブロックしました", "Blocked the user"))
    } catch {
      updateBlockedState(false)
      toast(t("ブロックの設定に失敗しました", "Failed to update block setting"))
    } finally {
      setIsLoading(false)
    }
  }

  const unBlockUser = async () => {
    setIsLoading(true)
    updateBlockedState(false)
    try {
      await unBlock({
        variables: {
          input: {
            userId: props.id,
          },
        },
      })
      toast(t("ユーザーのブロックを解除しました", "Unblocked the user"))
    } catch {
      updateBlockedState(true)
      toast(t("ブロックの設定に失敗しました", "Failed to update block setting"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant={props.variant ?? "secondary"}
      onClick={isBlocked ? unBlockUser : blockUser}
    >
      {isLoading || isBlockLoading || isUnBlockLoading ? (
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
      isBlocked
    }
  }`,
)

const unBlockUserMutation = graphql(
  `mutation unBlockUser($input: UnblockUserInput!) {
    unblockUser(input: $input) {
      id
      isBlocked
    }
  }`,
)
