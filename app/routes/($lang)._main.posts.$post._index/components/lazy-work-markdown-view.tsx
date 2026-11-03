import { lazy, memo, Suspense, type ComponentProps } from "react"

// エディタ（tiptap / markdown-it）は大きいので、小説・コラムを表示するときにだけ読み込む
const WorkMarkdownViewImpl = lazy(() =>
  import(
    "~/routes/($lang)._main.posts.$post._index/components/work-markdown-view"
  ).then((mod) => ({ default: mod.WorkMarkdownView })),
)

type Props = ComponentProps<typeof WorkMarkdownViewImpl>

/**
 * 親の再描画（Apollo のクエリの結果など）が、エディタの読み込みを待っている Suspense まで届かないように memo にする。
 * hydration が終わる前に届くと、React が中身を作り直してしまう（React error #421）
 */
export const WorkMarkdownView = memo(function WorkMarkdownView (
  props: Props,
): React.ReactNode {
  return (
    <Suspense fallback={null}>
      <WorkMarkdownViewImpl {...props} />
    </Suspense>
  )
})
