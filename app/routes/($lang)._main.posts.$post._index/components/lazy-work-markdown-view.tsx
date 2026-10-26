import { lazy, Suspense, type ComponentProps } from "react"

// エディタ（tiptap / markdown-it）は大きいので、小説・コラムを表示するときにだけ読み込む
const WorkMarkdownViewImpl = lazy(() =>
  import(
    "~/routes/($lang)._main.posts.$post._index/components/work-markdown-view"
  ).then((mod) => ({ default: mod.WorkMarkdownView })),
)

type Props = ComponentProps<typeof WorkMarkdownViewImpl>

export function WorkMarkdownView(props: Props): React.ReactNode {
  return (
    <Suspense fallback={null}>
      <WorkMarkdownViewImpl {...props} />
    </Suspense>
  )
}
