import { Button } from "~/components/ui/button"
import { PencilIcon } from "lucide-react"
import { useContext } from "react"
import { AuthContext } from "~/contexts/auth-context"
import { Link } from "@remix-run/react"
import type { IntrospectionEnum } from "~/lib/introspection-enum"

type Props = {
  targetWorkId: string
  targetWorkOwnerUserId: string
  type: IntrospectionEnum<"WorkType">
}

/**
 * 作品編集ボタン
 */
export function WorkEditorButton(props: Props) {
  const authContext = useContext(AuthContext)

  if (authContext.userId !== props.targetWorkOwnerUserId) {
    return null
  }

  const editUrl = (id: string, workType: IntrospectionEnum<"WorkType">) => {
    if (workType === "WORK") {
      return `/posts/${id}/image/edit`
    }
    if (workType === "VIDEO") {
      return `/posts/${id}/animation/edit`
    }
    if (workType === "COLUMN" || workType === "NOVEL") {
      return `/posts/${id}/text/edit`
    }

    return "/"
  }

  return (
    <div className="flex justify-end">
      <div className="flex space-x-2">
        <Link to={editUrl(props.targetWorkId, props.type)}>
          <Button className="space-x-2" aria-label={"編集"} variant="secondary">
            <PencilIcon width={16} />
            <p>編集</p>
          </Button>
        </Link>
      </div>
    </div>
  )
}
