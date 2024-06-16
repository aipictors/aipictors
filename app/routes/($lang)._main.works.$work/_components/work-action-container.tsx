import {} from "@/_components/ui/avatar"
import { WorkAction } from "@/routes/($lang)._main.works.$work/_components/work-action"
import {} from "@/_components/ui/tabs"
import { useContext } from "react"
import { AuthContext } from "@/_contexts/auth-context"
import { useSuspenseQuery } from "@apollo/client/index"
import { workQuery } from "@/_graphql/queries/work/work"

type Props = {
  title?: string
  imageUrl?: string
  workLikesCount: number
  targetWorkId: string
  targetWorkOwnerUserId: string
}

/**
 * 作品への操作一覧（いいね、フォルダに追加、シェア、メニュー）
 */
export const WorkActionContainer = (props: Props) => {
  const appContext = useContext(AuthContext)

  const { data } = useSuspenseQuery(workQuery, {
    skip: appContext.isLoading,
    variables: {
      id: props.targetWorkId,
    },
  })

  const isLiked = data?.work?.isLiked ?? false

  const isHideEditButton =
    data?.work?.type === "COLUMN" || data?.work?.type === "NOVEL"

  return (
    <WorkAction
      workLikesCount={props.workLikesCount}
      title={props.title}
      imageUrl={props.imageUrl}
      defaultLiked={isLiked}
      targetWorkId={props.targetWorkId}
      targetWorkOwnerUserId={props.targetWorkOwnerUserId}
      isHideEditButton={isHideEditButton}
    />
  )
}
