import { useContext, useState } from "react"
import { AuthContext } from "~/contexts/auth-context"
import { Button } from "~/components/ui/button"
import {} from "~/components/ui/popover"
import { useMutation, useQuery } from "@apollo/client/index"
import { toast } from "sonner"
import { Loader2Icon } from "lucide-react"
import { graphql } from "gql.tada"

type Props = {
  workId: string
  ownerUserId: string
  isRecommended: boolean
}

export function RecommendButton(props: Props) {
  const authContext = useContext(AuthContext)

  const { data: pass } = useQuery(viewerCurrentPassQuery, {
    skip: authContext.isNotLoggedIn || authContext.isLoading,
  })

  const passData = pass?.viewer?.currentPass

  const isStandardOrPremium =
    passData?.type === "STANDARD" || passData?.type === "PREMIUM"

  const [isRecommended, setIsRecommended] = useState(props.isRecommended)

  // useEffect(() => {
  //   setIsRecommended(props.isRecommended)
  // }, [props.isRecommended])

  const [deleteRecommend, { loading: isDeleting }] = useMutation(
    deleteRecommendedWorkMutation,
  )

  const [createRecommend, { loading: isCreating }] = useMutation(
    createRecommendedWorkMutation,
  )

  const onDeleteRecommend = async () => {
    try {
      await deleteRecommend({
        variables: {
          input: {
            workId: props.workId,
          },
        },
      })
      setIsRecommended(false)
    } catch (error) {
      if (error instanceof Error) {
        toast(error.message)
      }
    }
  }

  const onCreateRecommend = async () => {
    if (props.ownerUserId === authContext.userId) {
      toast("自分の作品には推薦できません")
      return
    }
    if (authContext.isNotLoggedIn) {
      toast("ログインしてください")
      return
    }
    if (!isStandardOrPremium) {
      toast(
        "作品を推薦して、注目度をアップできます！スタンダード、プレミアムプランのみ対応しています",
      )
      return
    }
    try {
      await createRecommend({
        variables: {
          input: {
            workId: props.workId,
          },
        },
      })
      setIsRecommended(true)
    } catch (error) {
      if (error instanceof Error) {
        toast(error.message)
      }
    }
  }

  return (
    <>
      {isRecommended ? (
        <Button onClick={onDeleteRecommend} variant={"secondary"}>
          {isDeleting ? (
            <Loader2Icon className="h-4 w-4 animate-spin" />
          ) : (
            <p>{"推薦済み"}</p>
          )}
        </Button>
      ) : (
        <Button onClick={onCreateRecommend} variant={"secondary"}>
          {isCreating ? (
            <Loader2Icon className="h-4 w-4 animate-spin" />
          ) : (
            <p>{"推薦"}</p>
          )}
        </Button>
      )}
    </>
  )
}

const createRecommendedWorkMutation = graphql(
  `mutation CreateRecommendedWork($input: CreateRecommendedWorkInput!) {
    createRecommendedWork(input: $input) {
      id
    }
  }`,
)

const deleteRecommendedWorkMutation = graphql(
  `mutation DeleteRecommendedWork($input: DeleteRecommendedWorkInput!) {
    deleteRecommendedWork(input: $input)
  }`,
)

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