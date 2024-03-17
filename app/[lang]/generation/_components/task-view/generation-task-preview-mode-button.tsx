import { Toggle } from "@/components/ui/toggle"
import { ScanSearch } from "lucide-react"

type Props = {
  onTogglePreviewMode(): void
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
      className="w-16"
      onClick={props.onTogglePreviewMode}
      size={"sm"}
    >
      <ScanSearch className="w-4" />
    </Toggle>
  )
}
