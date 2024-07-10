import { Button } from "@/_components/ui/button"
import { PencilIcon } from "lucide-react"
import { useContext } from "react"
import { AuthContext } from "@/_contexts/auth-context"
import { Link } from "@remix-run/react"

type Props = {
  targetWorkId: string
  targetWorkOwnerUserId: string
}

/**
 * 作品編集ボタン
 */
export const WorkEditorButton = (props: Props) => {
  const authContext = useContext(AuthContext)

  if (authContext.userId !== props.targetWorkOwnerUserId) {
    return null
  }

  return (
    <div className="flex justify-end">
      <div className="flex space-x-2">
        <Link to={`/posts/${props.targetWorkId}/edit`}>
          <Button className="space-x-2" aria-label={"編集"} variant="secondary">
            <PencilIcon width={16} />
            <p>編集</p>
          </Button>
        </Link>
      </div>
    </div>
  )
}
