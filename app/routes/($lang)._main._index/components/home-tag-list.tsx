import { useRef } from "react"
import { TagButton } from "~/routes/($lang)._main._index/components/tag-button"
import { graphql, type FragmentOf } from "gql.tada"
import { useTranslation } from "~/hooks/use-translation"
import { getJstDate } from "~/utils/jst-date"

type Props = {
  hotTags: FragmentOf<typeof HomeTagListItemFragment>[]
  themeTitle?: string
}

/**
 * ホーム上部に表示するタグ一覧
 * ブラウザの横スクロールで並べる（以前はカルーセルのライブラリを使っていたが、
 * 開いた直後の初期化でレイアウトの計算をやり直させていて、スマホで重かった）
 */
export function HomeTagList (props: Props) {
  const today = getJstDate()
  const t = useTranslation()
  const drag = useMouseDragScroll()

  return (
    <nav aria-label={t("おすすめのタグ", "Recommended tags")}>
      <ul
        ref={drag.ref}
        className="-mx-1 flex snap-x gap-4 overflow-x-auto overscroll-x-contain px-1 py-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        onPointerDown={drag.onPointerDown}
        onPointerMove={drag.onPointerMove}
        onPointerUp={drag.onPointerUp}
        onPointerCancel={drag.onPointerUp}
        onClickCapture={drag.onClickCapture}
        onDragStart={(event) => event.preventDefault()}
      >
        {props.themeTitle && (
          <li className="shrink-0 snap-start">
            <TagButton
              link={`/themes/${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`}
              name={`今日のお題「${props.themeTitle}」`}
              isTagName={true}
            />
          </li>
        )}
        {props.hotTags?.map((tag) => (
          <li className="shrink-0 snap-start" key={tag.id}>
            <TagButton
              link={`/tags/${tag.name}`}
              name={tag.name}
              isTagName={true}
            />
          </li>
        ))}
      </ul>
    </nav>
  )
}

/**
 * PC のマウスでもドラッグで横にスクロールできるようにする（タッチ・トラックパッドはブラウザに任せる）
 */
function useMouseDragScroll() {
  const ref = useRef<HTMLUListElement>(null)
  const state = useRef({ isDown: false, startX: 0, startScroll: 0, moved: 0 })

  return {
    ref,
    onPointerDown: (event: React.PointerEvent<HTMLUListElement>) => {
      if (event.pointerType !== "mouse" || event.button !== 0 || !ref.current) {
        return
      }
      state.current = {
        isDown: true,
        startX: event.clientX,
        startScroll: ref.current.scrollLeft,
        moved: 0,
      }
    },
    onPointerMove: (event: React.PointerEvent<HTMLUListElement>) => {
      if (!state.current.isDown || !ref.current) return
      const dx = event.clientX - state.current.startX
      state.current.moved = Math.max(state.current.moved, Math.abs(dx))
      if (state.current.moved > 4) {
        ref.current.scrollLeft = state.current.startScroll - dx
      }
    },
    onPointerUp: () => {
      state.current.isDown = false
    },
    // ドラッグしたあとに指を離した位置のタグが開かないようにする
    onClickCapture: (event: React.MouseEvent<HTMLUListElement>) => {
      if (state.current.moved > 4) {
        event.preventDefault()
        event.stopPropagation()
        state.current.moved = 0
      }
    },
  }
}

export const HomeTagListItemFragment = graphql(
  `fragment HomeTagListItem on TagNode @_unmask {
    id
    name
  }`,
)
