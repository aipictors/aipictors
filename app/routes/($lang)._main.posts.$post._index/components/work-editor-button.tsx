import { Button } from "~/components/ui/button"
import { PencilIcon } from "lucide-react"
import { useContext } from "react"
import { AuthContext } from "~/contexts/auth-context"
import { Link } from "@remix-run/react"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  targetWorkId: string
  targetWorkOwnerUserId: string
  type: IntrospectionEnum<"WorkType">
}

/**
 * 作品編集ボタン
 */
export function WorkEditorButton (props: Props) {
  const authContext = useContext(AuthContext)

  const t = useTranslation()

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
          <Button
            className="space-x-2"
            aria-label={t("編集", "Edit")}
            variant="secondary"
          >
            <PencilIcon width={16} />
            <p>{t("編集", "Edit")}</p>
          </Button>
        </Link>
      </div>
    </div>
  )
}
