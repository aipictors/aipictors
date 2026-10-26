import { lazy, Suspense, type ComponentProps } from "react"

// 作品ダイアログは作品記事やコメント入力など大きなモジュールに依存するため、
// 開いたときにだけ読み込む
const WorkViewerDialogImpl = lazy(() =>
  import("~/components/work/work-viewer-dialog").then((mod) => ({
    default: mod.WorkViewerDialog,
  })),
)

type Props = ComponentProps<typeof WorkViewerDialogImpl>

export function WorkViewerDialog(props: Props): React.ReactNode {
  return (
    <Suspense fallback={null}>
      <WorkViewerDialogImpl {...props} />
    </Suspense>
  )
}
