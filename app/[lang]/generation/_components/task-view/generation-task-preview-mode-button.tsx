import { Toggle } from "@/components/ui/toggle"
import { ScanSearch } from "lucide-react"

type Props = {
  onTogglePreviewMode(): void
  defaultChecked?: boolean
}

/**
 * 履歴プレビューモード切替ボタン
 * @param props
 * @returns
 */
export function GenerationTaskPreviewModeButton(props: Props) {
  return (
    <Toggle
      title="カーソルを当てたときに左画面にプレビュー表示する"
      onClick={props.onTogglePreviewMode}
      defaultPressed={props.defaultChecked}
    >
      <ScanSearch className="w-4" />
    </Toggle>
  )
}
