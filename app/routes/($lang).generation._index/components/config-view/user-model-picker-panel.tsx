import { Link } from "@remix-run/react"
import { ExternalLinkIcon, UploadIcon } from "lucide-react"
import { UserModelBrowser } from "~/components/user-models/user-model-browser"
import type { UserModel, UserModelKind } from "~/lib/user-models/types"

type Props = {
  kind: UserModelKind
  selectedIds: string[]
  onSelect(model: UserModel): void
}

/**
 * 生成画面のピッカー内「みんなのモデル」タブ
 */
export function UserModelPickerPanel(props: Props) {
  return (
    <div className="flex min-h-0 flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-muted/60 px-3 py-2 text-xs">
        <span className="text-muted-foreground">
          {props.kind === "LORA"
            ? "みんながアップロードした LoRA を追加できます（推奨ウェイトとトリガーワードも自動で入ります）"
            : "みんながアップロードしたチェックポイントで生成できます"}
        </span>
        <span className="flex gap-3">
          <Link
            to="/models"
            target="_blank"
            className="flex items-center gap-1 font-medium hover:underline"
          >
            <ExternalLinkIcon className="size-3" />
            一覧ページ
          </Link>
          <Link
            to="/models/upload"
            target="_blank"
            className="flex items-center gap-1 font-medium text-primary hover:underline"
          >
            <UploadIcon className="size-3" />
            アップロード
          </Link>
        </span>
      </div>
      <div className="-mx-1 max-h-[58vh] min-h-[50vh] overflow-y-auto px-1 pt-1">
        <UserModelBrowser
          fixedKind={props.kind}
          compact
          selectedIds={props.selectedIds}
          onSelect={props.onSelect}
        />
      </div>
    </div>
  )
}
