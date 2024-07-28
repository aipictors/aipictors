import { useContext, useEffect, useState } from "react"
import { AuthContext } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"
import { Link } from "@remix-run/react"
import { useMutation } from "@apollo/client/index"
import { toast } from "sonner"
import { Loader2Icon } from "lucide-react"
import { graphql } from "gql.tada"

type Props = {
  workId: string
  ownerUserId: string
  isRecommended: boolean
}

export const RecommendButton = (props: Props) => {
  const authContext = useContext(AuthContext)

  const [isRecommended, setIsRecommended] = useState(props.isRecommended)

  useEffect(() => {
    setIsRecommended(props.isRecommended)
  }, [props.isRecommended])

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

  if (authContext.isLoading || authContext.isNotLoggedIn) {
    return (
      <Popover>
        <PopoverTrigger>
          <Button variant={"secondary"}>{"推薦"}</Button>
        </PopoverTrigger>
        <PopoverContent>
          <p>{"作品を推薦して、注目度をアップできます！"}</p>
          <Link to={"/plus"}>
            {"スタンダード、プレミアムプランのみ対応しています"}
          </Link>
        </PopoverContent>
      </Popover>
    )
  }

  if (props.ownerUserId === authContext.userId) {
    return null
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
